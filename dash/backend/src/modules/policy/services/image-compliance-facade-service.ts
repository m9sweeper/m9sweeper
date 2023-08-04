import { Injectable, NotFoundException } from '@nestjs/common';
import { ExceptionQueryDto } from '../../exceptions/dto/exception-dto';
import { ExceptionsService } from '../../exceptions/services/exceptions.service'
import { ListOfImagesDto } from '../../image/dto/image-result.dto';
import { ScannerService } from '../../scanner/services/scanner.service';
import { ImageScanResultPerPolicyFacadeDto, ImageScanResultPerPolicyDto, ImageScanIssueDto } from '../dto/image-scan-results-perpolicy-dto';
import { ImageComplianceService } from './image-compliance-service';
import { PolicyService } from './policy-service';
import { ComplianceIssue, ComplianceResultMap } from '../entities/compliance-result-map';
import {PolicyDto} from '../dto/policy-dto';
import {ExceptionCreateDto} from '../../exceptions/dto/exceptioncreateDto';
import {ExceptionType} from '../../exceptions/enum/ExceptionType';
import {addDays, formatISO} from 'date-fns';
import {ExceptionK8sInfoDto} from '../../exceptions/dto/exception-k8s-info-dto';

@Injectable()
export class ImageComplianceFacadeService {
    constructor(private readonly complianceService: ImageComplianceService, 
        private readonly policyService: PolicyService,
        private readonly scannerService: ScannerService,
        private readonly exceptionService: ExceptionsService) {}

    public async isImageClusterCompliant(
      clusterId: number,
      imageData: ListOfImagesDto,
      results: ImageScanResultPerPolicyFacadeDto[]
    ): Promise<{compliant: boolean, complianceMap: ComplianceResultMap}> {

        if (!!imageData === false) {
            throw new NotFoundException("Invalid image data");
        }

        const policyIdSet = new Set(results.map(result => result.policyId));
        const policyIds = Array.from(policyIdSet.keys());
        await this.applyOverrideSeverity(clusterId, policyIds, results);
        const exceptions = await this.exceptionService.getAllFilteredPolicyExceptions(clusterId,
         policyIds, undefined);

        // The compliance map will get mutated by
        const complianceMap = new ComplianceResultMap();
    
        await this.isImageCompliant(results, exceptions, imageData.name, complianceMap);


        const issuesWithReasons = complianceMap.getAllIssues();
        const nonCompliantIssues = issuesWithReasons.filter(issue => !issue.compliant);

        await this.applyTemporaryExceptions(clusterId, nonCompliantIssues, complianceMap, imageData.name);

        // Checking the compliance map's compliant property in case temporary exceptions made it compliant
        return { compliant: complianceMap.isCompliant, complianceMap };
    }

    public async applyOverrideSeverity(
        clusterId: number,
        policyId: number [],
        results: ImageScanResultPerPolicyFacadeDto[]
    ){
        const exceptionsOverride = await this.exceptionService.getAllFilteredOverrideExceptions(clusterId, policyId);
        for(const result of results){
            for(const issue of result.issues){
                const override = exceptionsOverride?.find(exception => exception.issueIdentifier.toUpperCase() === issue.type.toUpperCase());
                if(override?.altSeverity){
                    issue.severity = override.altSeverity
                    issue.name = "overridden - "+ issue.name;
                }
            }
        }

    }

    public async isImageNamespaceCompliant(clusterId: number,
        imageData: ListOfImagesDto,
        namespaceName: string,
        results: ImageScanResultPerPolicyFacadeDto[]):
        Promise<{ compliant: boolean,  complianceMap: ComplianceResultMap}> {

        if (!!imageData === false) {
            throw new NotFoundException("Invalid image data");
        }

        if (!!namespaceName === false) {
            throw new NotFoundException("Invalid namespace name");
        }

        const policyIdSet = new Set(results.map(result => result.policyId));
        const exceptions = await this.exceptionService.getAllFilteredPolicyExceptions(clusterId,
            Array.from(policyIdSet.keys()), namespaceName);

        const complianceMap = new ComplianceResultMap();

        await this.isImageCompliant(results, exceptions, imageData.name, complianceMap);

        const issuesWithReasons = complianceMap.getAllIssues();
        const nonCompliantIssues = issuesWithReasons.filter(i => !i.compliant);

        await this.applyTemporaryExceptions(clusterId, nonCompliantIssues, complianceMap, imageData.name, namespaceName);

        return { compliant: complianceMap.isCompliant, complianceMap };
    }


    /**
     * Calculates image compliance accounting only for current information (Does not create temporary exceptions)
     * @param results
     * @param exceptions
     * @param imageName
     * @param complianceMap
     * @private
     */
    private async isImageCompliant(
      results: ImageScanResultPerPolicyFacadeDto[],
      exceptions:ExceptionQueryDto[],
      imageName: string,
      complianceMap: ComplianceResultMap
    ): Promise<boolean> {
        if (!!exceptions === false) {
            exceptions = [];
        }

        if (!results?.length) {
            complianceMap.setResultForPolicy(-1, false, 'image has not been scanned');
            return false;
        }

        exceptions = this.exceptionService.filterExceptionsByImageName(imageName, exceptions);

        const scanResults = await Promise.all(results.map(async result => {
            const scanResult = new ImageScanResultPerPolicyDto();
            scanResult.encounteredError = result.encounteredError;
            scanResult.policy = await this.policyService.getPolicyById(result.policyId);
            scanResult.scanners = await this.scannerService.getScannersByPolicyId(result.policyId);
            scanResult.exceptions = exceptions.filter(e => e.policyId && e.policyId === result.policyId);

            scanResult.issues = result.issues.map(issue => {
                const scanResultIssue = new ImageScanIssueDto();
                scanResultIssue.cveCode = issue.type;
                scanResultIssue.isFixable = issue.isFixable;
                scanResultIssue.scannerId = issue.scannerId;
                scanResultIssue.severity = issue.severity;
                return scanResultIssue;
            })

            return scanResult;
        }))

        return this.complianceService.isImageCompliant(scanResults, exceptions.filter(e => e.relevantForAllPolicies), complianceMap);
    }

    protected async applyTemporaryExceptions(clusterId: number,
                                             nonCompliantIssues: ComplianceIssue[],
                                             complianceMap: ComplianceResultMap,
                                             imageName: string,
                                             namespace?: string
    ): Promise<void> {
        const policies = new Map<number, PolicyDto>();
        const issuesToCreate = new Array<{
            policyId: number,
            scannerId: number,
            clusterId: number,
            cve: string,
            days: number,
            imageName: string,
            severity: string,
            namespace?: string
        }>();
        for(const issue of nonCompliantIssues) {
            const exceptionExists = await this.exceptionService.tempExceptionCreated(clusterId, issue.policyId,
                issue.scannerId, namespace ?? '', issue.cve, imageName);
            // There has not been an exception created for this CVE, check if we should create a temporary one based
            // on the policy's grace period settings
            if (!exceptionExists) {

                // Look at the policy, retrieving it from the DB if needed.
                let policy: PolicyDto;
                if (policies.get(issue.policyId)) {
                    policy = policies.get(issue.policyId)
                } else {
                    policy = await this.policyService.getPolicyById(issue.policyId);
                    policies.set(issue.policyId, policy);
                }
                const gracePeriod = policy.newScanGracePeriod;
                if (gracePeriod > 0) {
                    issuesToCreate.push({
                        policyId: policy.id,
                        scannerId: issue.scannerId,
                        clusterId,
                        cve: issue.cve,
                        days: gracePeriod,
                        imageName,
                        severity: issue.severity,
                        namespace
                    });
                    complianceMap.setResultForCve(policy.id, issue.scannerId, issue.cve, true,
                        'Temporary exception created', issue.severity);
                }
            }
        }
        await this.saveTemporaryException(issuesToCreate);
    }

    protected async saveTemporaryException(issuesToCreate: {policyId: number,
                                           scannerId: number,
                                           clusterId: number,
                                           cve: string,
                                           days: number,
                                           imageName: string,
                                           severity: string,
                                           namespace?: string}[]
    ): Promise<number[]> {
        const exceptions: {exception: ExceptionCreateDto, k8sInfo: ExceptionK8sInfoDto}[] = [];

        for (const issue of issuesToCreate) {
            const exception = new ExceptionCreateDto();
            const k8sInfo = new ExceptionK8sInfoDto();

            exception.relevantForAllPolicies = false;
            exception.policies = [issue.policyId];
            exception.relevantForAllKubernetesNamespaces = !!issue.namespace;
            exception.namespaces = !!issue.namespace ? [issue.namespace] : [];
            exception.scannerId = issue.scannerId;
            exception.relevantForAllClusters = false;
            exception.clusters = [issue.clusterId];
            exception.title = `Temporary Exception for ${issue.cve}`;
            exception.issueIdentifier = issue.cve
            exception.status = ExceptionType.ACTIVE;
            exception.startDate = formatISO(new Date(), {representation: 'date'});
            exception.endDate = formatISO(addDays(Date.now(), issue.days), {representation: 'date'});
            exception.isTempException = true;

            k8sInfo.imageName = issue.imageName;
            k8sInfo.severity = issue.severity;

            exceptions.push({exception, k8sInfo});
        }


        // @TODO: how to identify the user here ? Setting this to super admin
        return this.exceptionService.createException(exceptions, 1, true, false);
    }
}
