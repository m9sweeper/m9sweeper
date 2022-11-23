import { Injectable, NotFoundException } from '@nestjs/common'
import { ScannerDto } from 'src/modules/scanner/dto/scanner-dto';
import { ImageScanResultPerPolicyDto, ImageScanIssueDto, ImageScanExceptionDto } from '../dto/image-scan-results-perpolicy-dto';
import { IssueSeverityType } from '../enum/IssueSeverityType';
import {ComplianceResultMap} from "../entities/compliance-result-map";

/**
 * Defines service for checking compliance for an image. The compliance chekcing can
 * be done as clusterwise or namesacewise.
 */

@Injectable()
export class ImageComplianceService {

    /**
     * Given image scan results of an image with exceptions this method decide whether the 
     * image is compliance or not.
     * @param results - contains scan result per policy of an image. 
     * @param globalExceptions - list of general exceptions which are not policy specifics.
     * @returns true if the image is compliance otherwise returns false.
     */
    public isImageCompliant(results: ImageScanResultPerPolicyDto[], globalExceptions: ImageScanExceptionDto[], complianceMap: ComplianceResultMap): boolean {
        // If an error was encountered, the image is marked as non-compliant
        if (results && results.length > 0) {
            if (results.filter(r => r.encounteredError).length > 0) {
                complianceMap.setResultForPolicy(results[0].policy.id, false, 'Error encountered scanning image');
                return false;
            }
            const complianceByPolicy = results.map(result => {
                return this.isImageCompliantPerResult(result, globalExceptions, complianceMap);
            });

            return complianceByPolicy.every(policyResult => policyResult);
        }

        return false;
    }

    /**
     * This method decided whether an image is compliant or not for a result.
     * @param result - an image scan result for a policy.
     * @param globalExceptions - list of general exceptions which are not policy specific.
     * @returns true if the image is compliant otherwise returns false.
     */
    private isImageCompliantPerResult(result: ImageScanResultPerPolicyDto, globalExceptions: ImageScanExceptionDto[], complianceMap: ComplianceResultMap): boolean {
        if (!!result.policy === false) {
            throw new NotFoundException("No policies defined");
        }

        if (!!result.scanners === false || result.scanners.length === 0) {
            complianceMap.setResultForPolicy(result.policy.id, true, `Policy ${result.policy.name} has no scanners defined`);
        }

        //by default compliant
        if (result.policy.enabled === false) {
            complianceMap.setResultForPolicy(result.policy.id, true, `Policy ${result.policy.name} was disabled`);
        }

        return this.checkCompliance(result, globalExceptions, complianceMap);
    }

   /**
    * This method performs filtering of the issues using the exceptions
    * passed in.
    * @param exceptions - list of exceptions policy specific or general.
    * @param issues - issues to be filtered using exceptions passed in.
    * @returns filtered list of issues.
    */
    private applyExceptions(exceptions: ImageScanExceptionDto[], issues: ImageScanIssueDto[], policyId: number, complianceMap: ComplianceResultMap): ImageScanIssueDto[] {
        // No exceptions, means no issues have been excepted
        if (!!exceptions === false || exceptions.length === 0) {
            return issues;
        }

        // No issues, means no exceptions need to be applied
        if (!!issues === false || issues.length === 0) {
            return [];
        }

        //find all the exceptions which are not a scanner specific
        const exceptionsWithoutScanner = exceptions.filter(element => !!element.scannerId === false);

        //check whether there exist an exception which is not bound to any specific cve in
        //the scannerless exception list
       const overallException = exceptionsWithoutScanner.find(element => !!element.issueIdentifier === false || element.issueIdentifier.trim() === "");
        if (!!overallException) {
            issues.forEach((issue) => {
                complianceMap.setResultForCve(policyId, issue.scannerId, issue.cveCode, true,
                    `Exception ${overallException.title} applied.`, issue.severity);
            });
            return [];
        }

        //creates scanner to exceptions map for exceptions which are scanner specific
        const scannerToExceptionsMap = new Map<number, ImageScanExceptionDto[]>();

        exceptions.forEach(element => {
            if (element.scannerId) {
                if (scannerToExceptionsMap.has(element.scannerId) === false) {
                    scannerToExceptionsMap.set(element.scannerId, new Array<ImageScanExceptionDto>());
                }    
                
                scannerToExceptionsMap.get(element.scannerId).push(element);
            }
        })

        // Check for exceptions
        const issuesWithoutExceptions = issues.filter(issue => {
            if (scannerToExceptionsMap.has(issue.scannerId)) {
                const scannerExceptions = scannerToExceptionsMap.get(issue.scannerId);

                //check whether scanner specific exceptions contains generic cve
                const scannerSpecificException = scannerExceptions.find(element => !!element.issueIdentifier === false || element.issueIdentifier.trim() === "");
                if (!!scannerSpecificException) {
                    complianceMap.setResultForCve(policyId, issue.scannerId, issue.cveCode, true,
                        `Exception ${scannerSpecificException.title} applied`, issue.severity);
                    return false;
                }

                //check whether scanner specific exceptions contains cve code of the issue
                const cveException = scannerExceptions.find(element => element.issueIdentifier.trim() === issue.cveCode);
                if (!!cveException) {
                    complianceMap.setResultForCve(policyId, issue.scannerId, issue.cveCode, true,
                        `Exception ${cveException.title} applied`, issue.severity);
                    return false;
                }
            }

            //check whether cve code of the issue exist in scannerless exceptions
            const globalCveException = exceptionsWithoutScanner.find(element => element.issueIdentifier === issue.cveCode)
            if (!!globalCveException) {
                complianceMap.setResultForCve(policyId, issue.scannerId, issue.cveCode, true,
                    `Exception ${globalCveException.title} applied`, issue.severity);
                return false;
            }

            return true;
        });

        return issuesWithoutExceptions;
    }

   /**
    * Calculate compliance for a result.
    * @param result - result specific to a policy.
    * @param globalExceptions - general exceptions.
    * @returns true if the result is compliant otherwise false.
    */
    private checkCompliance(result: ImageScanResultPerPolicyDto, globalExceptions: ImageScanExceptionDto[], complianceMap: ComplianceResultMap): boolean {
        // no issues by default compliant
        if (!!result.issues === false || result.issues.length === 0) {
            return true;
        }

        // Ignore disabled policies
        if (result.policy.enabled === false) {
            complianceMap.setResultForPolicy(result.policy.id, true,`Policy ${result.policy.name} was disabled`);
            return true;
        }

        const allExceptions: ImageScanExceptionDto[] = [];

        if (globalExceptions) {
            allExceptions.push(...globalExceptions);
        }

        if (result.exceptions) {
            allExceptions.push(...result.exceptions);
        }

        const scannerToIssueMap = new Map<number, Array<ImageScanIssueDto>>();

        result.issues.forEach(issue => {
            if (scannerToIssueMap.has(issue.scannerId) === false) {
                scannerToIssueMap.set(issue.scannerId, new Array<ImageScanIssueDto>());
            }

            scannerToIssueMap.get(issue.scannerId).push(issue);
        })

        let filteredScanners = result.scanners.filter(element => scannerToIssueMap.has(element.id));

        // every issue should have a scannerId present in scanners list
        if (filteredScanners.length !== scannerToIssueMap.size) {
            throw new NotFoundException('Invalid scanner list provided');
        }

        // for enforced policy only required scanners are considered
        if (result.policy.enforcement) {
            filteredScanners = filteredScanners.filter(element => element.required);
        }

        /**
         * For each scanner group issues by severity and then check 
         * for each severity the issues in the severity respects
         * scanner settings. The issues to be considered are filtered by
         * exceptions beforehand.
         */
        const results = filteredScanners.map(scanner => {
            if (scanner.enabled === false) {
                complianceMap.setResultForScanner(scanner.policyId, scanner.id, true, `Scanner ${scanner.name} disabled.`);
                return true;
            }

            const issues = this.applyExceptions(allExceptions, scannerToIssueMap.get(scanner.id), scanner.policyId, complianceMap);

            if (issues.length === 0) {
                return true;
            }

            const issuesBySeverity = new Map<string, Array<ImageScanIssueDto>>();

            issues.forEach(issue => {
                const severity = issue.severity.toUpperCase();
                if (issuesBySeverity.has(severity) === false) {
                    issuesBySeverity.set(severity, new Array<ImageScanIssueDto>());
                }

                issuesBySeverity.get(severity).push(issue);
            });

            // Since we need to evaluate the scanner settings for every severity type, we are intentionally
            // putting the '&& compliant' after the scanner settings to avoid short circuit evaluation
            let compliant = true;
            Array.from(issuesBySeverity.keys()).forEach(severity =>
              compliant = this.checkScannerSettings(IssueSeverityType[severity], scanner,
                    issuesBySeverity.get(severity), complianceMap) && compliant);
            return compliant;
        });
        
        /**
         * If the policy is enforced then the image is compliant if 
         * every item in results array is true.
         */
         if (result.policy.enforcement) {
             return results.every(status => status === true);
        } 

        /**
         * If the policy is not enforced then the image is compliant 
         * if any item in the results array is true.
         */
        return results.some(status => status === true) || results.length === 0;
    }

    /**
     * Count number of fixable issues and unfixable issues per severity and check those
     * against vulnerabilitySettings in scanners. 
     * @param severity - severity of the isseus.
     * @param scanner - scanner to be check against.
     * @param issues - list of issues needs to be chcked.
     * @returns 
     */
    private checkScannerSettings(severity:IssueSeverityType, scanner: ScannerDto, issues: ImageScanIssueDto[], complianceMap: ComplianceResultMap): boolean {
        if (!!issues === false) {
            return true;
        }

        let fixableLimit = -1;
        let unfixableLimit = -1;

        switch(severity) {
            case IssueSeverityType.CRITICAL:
                fixableLimit = scanner.vulnerabilitySettings.fixableCritical;
                unfixableLimit = scanner.vulnerabilitySettings.unFixableCritical;
                break;
            case IssueSeverityType.HIGH:
                fixableLimit = scanner.vulnerabilitySettings.fixableMajor;
                unfixableLimit = scanner.vulnerabilitySettings.unFixableMajor;
                break;
            case IssueSeverityType.LOW:
                fixableLimit = scanner.vulnerabilitySettings.fixableLow;
                unfixableLimit = scanner.vulnerabilitySettings.unFixableLow;
                break;
            case IssueSeverityType.MEDIUM:
                fixableLimit = scanner.vulnerabilitySettings.fixableNormal;
                unfixableLimit = scanner.vulnerabilitySettings.unFixableNormal;
                break;
            case IssueSeverityType.NEGLIGIBLE:
                fixableLimit = scanner.vulnerabilitySettings.fixableNegligible;
                unfixableLimit = scanner.vulnerabilitySettings.unFixableNegligible;
                break;
        }

        const unfixableIssues = issues.filter(issue => !issue.isFixable);
        const totalUnfixableIssues = unfixableIssues.length;
        if (totalUnfixableIssues >= unfixableLimit) {
            unfixableIssues.forEach((issue) => {
                complianceMap.setResultForCve(scanner.policyId, scanner.id, issue.cveCode, false,
                    `Too many unfixable ${severity} severity issues`, issue.severity);
            });
        }

        const fixableIssues = issues.filter(issue => issue.isFixable);
        const totalFixableIssues = fixableIssues.length;
        if (totalFixableIssues >= fixableLimit) {
            fixableIssues.forEach((issue) => {
                complianceMap.setResultForCve(scanner.policyId, scanner.id, issue.cveCode, false,
                    `Too many fixable ${severity} severity issues`, issue.severity);
            });
        }

        return totalFixableIssues <= fixableLimit && totalUnfixableIssues <= unfixableLimit;
    }
}

