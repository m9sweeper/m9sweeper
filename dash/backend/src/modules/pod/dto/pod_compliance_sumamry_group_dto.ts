export class PodComplianceSummaryGroupDto {
    count: number;
    savedDate: Date;
    compliant: boolean;
    clusterId: number;
    namespace?: string;
}
