import {Injectable, Scope} from '@nestjs/common';
import {ImageTrawlerResultDto} from '../../image/dto/image-trawler-result.dto';
import {PolicyService} from './policy-service';
import {ScannerService} from '../../scanner/services/scanner.service';
import {ScanImageIssue} from '../../image/dto/image-result.dto';
import {PolicyDto} from '../dto/policy-dto';
import {ScannerDto} from '../../scanner/dto/scanner-dto';

@Injectable({scope: Scope.REQUEST})
export class PolicyComplianceCheckerService {

    constructor(private readonly policyService: PolicyService,
                private readonly scannerService: ScannerService) {
    }

    async run(clusterId: number, imageId: number, imageTrawlerResultDto: ImageTrawlerResultDto): Promise<ImageTrawlerResultDto> {

        const allowedFixableIssueCountPerSeverity = {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: -1,
            LOW: -1,
            NEGLIGIBLE: -1,
        };

        const allowedIssueCountPerSeverity = {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: -1,
            LOW: -1,
            NEGLIGIBLE: -1,
        };

        const policy: PolicyDto = await this.policyService.getPolicyById(imageTrawlerResultDto.policyId);
        const scanners: ScannerDto[] = await this.scannerService.getScannersByPolicyId(policy.id);

        const assessVendorCompliance = (rs: { severity: string; issues: any[] }) => {
            let isPassed = true;
            if (rs) {
                const severity = rs.severity.toUpperCase();
                if (Object.keys(allowedIssueCountPerSeverity).includes(severity)) {
                    if (allowedFixableIssueCountPerSeverity[severity] < 0) {
                        isPassed = true;
                    } else if (allowedFixableIssueCountPerSeverity[severity] >= 0) {
                        isPassed = rs.issues.filter(o => o.isFixable).length <= allowedFixableIssueCountPerSeverity[severity];
                    }

                    if (allowedIssueCountPerSeverity[severity] < 0) {
                        isPassed = isPassed && true;
                    } else if (allowedIssueCountPerSeverity[severity] >= 0) {
                        isPassed = isPassed && rs.issues.filter(o => o.isFixable).length <= allowedIssueCountPerSeverity[severity];
                    }
                }
            }
            return isPassed;
        };

        const perScannerRs: any[] = imageTrawlerResultDto.issues.reduce((scannerIds: number[], issue: ScanImageIssue) => {
            if (!scannerIds.includes(issue.scannerId)) {
                scannerIds.push(issue.scannerId);
            }
            return scannerIds;
        }, []).map(scannerId => ({
            scanner: scanners.find(s => s.id === scannerId),
            issuesBySeverity: [],
            isPassed: false,
            issues: imageTrawlerResultDto.issues.filter(issue => issue.scannerId)
        })).map(o => {
            o['issuesBySeverity'] = <{ severity: string; issues: any[] }[]>o.issues.reduce((all: { severity: string; issues: any[] }[], current) => {
                const severityIndex = all.findIndex(issue => issue.severity === current.severity);
                if (severityIndex === -1) {
                    all.push({
                        severity: current.severity,
                        issues: []
                    });
                }
                all[severityIndex > -1 ? severityIndex : 0].issues.push(current);
                return all;
            }, []);
            delete o.issues;
            return o;
        }).map(o => {
            o.isPassed = Object.keys(allowedIssueCountPerSeverity)
                .map(severity => assessVendorCompliance(o.issuesBySeverity.find(s => s.severity.toUpperCase() === severity)))
                .every(status => status === true);
            return o;
        }).map(o => ({...o.scanner, isPassed: o.isPassed}));

        if (policy.enforcement) {
            imageTrawlerResultDto.policyStatus = perScannerRs.filter(o => o.required).map(o => o.isPassed).filter(status => status === false)?.length === 0;
        } else {
            imageTrawlerResultDto.policyStatus = perScannerRs.map(o => o.isPassed).filter(status => status === true)?.length > 0;
        }

        return imageTrawlerResultDto;
    }

}
