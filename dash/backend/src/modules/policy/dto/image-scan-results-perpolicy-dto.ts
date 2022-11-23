import { ScanImageIssue } from "src/modules/image/dto/image-result.dto";
import { ScannerDto } from "src/modules/scanner/dto/scanner-dto";
import { PolicyDto } from "./policy-dto";

export class ImageScanResultPerPolicyDto {
    /**
     * Speicifes the policy which is used during image scanning process
     */
    policy: PolicyDto;

    /**
     * Lis of issues found during scanning.
     */
    issues: ImageScanIssueDto[];

    /**
     * scanners for the policy
     */
    scanners: ScannerDto[];

    /**
     * exceptions fot the policy
     */
    exceptions: ImageScanExceptionDto[];

    /**
     * set to to true when error ocurred during scanning.
     */
    encounteredError: boolean;
}

export class ImageScanResultPerPolicyFacadeDto {
    title: string;
    policyId: number;
    encounteredError: boolean;
    issues: ScanImageIssue[];
}

export class ImageScanIssueDto {
    scannerId: number;
    severity: string;
    isFixable: boolean;
    cveCode: string;
}

export class ImageScanExceptionDto {
    title: string;
    issueIdentifier: string;
    imageMatch: string;
    scannerId: number;
}