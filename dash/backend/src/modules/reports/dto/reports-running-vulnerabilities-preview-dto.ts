import {IsArray, IsNumber} from 'class-validator';
import {ReportsRunningVulnerabilitiesDto} from "./reports-running-vulnerabilities-dto";
import {ReportsHistoricalVulnerabilitiesDto} from "./reports-historical-vulnerabilities-dto";

export class ReportsRunningVulnerabilitiesPreviewDto {
    @IsNumber()
    count: number;

    @IsArray()
    results: Array<ReportsRunningVulnerabilitiesDto>;
}

export class ReportsHistoricalVulnerabilitiesPreviewDto {
    @IsNumber()
    count: number;

    @IsArray()
    results: Array<ReportsHistoricalVulnerabilitiesDto>;
}