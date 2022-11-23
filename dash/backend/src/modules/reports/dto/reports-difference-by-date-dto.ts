import {ReportsVulnerabilityExportDto} from './reports-vulnerability-export-dto';

export class ReportsDifferenceByDateDto {
    fixedVulnerabilities: ReportsVulnerabilityExportDto[];

    newVulnerabilities: ReportsVulnerabilityExportDto[];

    countOfFixedVulnerabilities: number;

    countOfNewVulnerabilities: number;
}
