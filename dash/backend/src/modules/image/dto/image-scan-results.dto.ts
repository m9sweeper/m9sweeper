import {IsArray, IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import {Expose, Transform, Type} from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";
import { ImageScanResultDto } from '../open-api-schema/trawler-scan-schema';
import { ImageScanResultsIssueDto } from '../../image-scan-results-issue/dto/image-scan-results-issue-dto';

export class ImageScanResultsDto {

    @IsNumber()
    @Expose({name:'id', toPlainOnly:true})
    id: number

    @IsNumber()
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number

    @IsNumber()
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number

    @IsNumber()
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number

    @IsNumber()
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number

    @IsNumber()
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number

    @IsString()
    @Expose({name: 'scanner_name', toPlainOnly:true})
    scannerName: string

    @IsNumber()
    @Expose({name: 'image_id', toPlainOnly:true})
    imageId: number

    @IsString()
    @Expose({name: 'summary', toPlainOnly:true})
    summary: string

    @IsString()
    @Expose({name: 'scan_results', toPlainOnly:true})
    scanResults: string

    @IsNumber()
    @Expose({name: 'policy_id', toPlainOnly: true})
    policyId: number

    @IsBoolean()
    @Expose({name: 'policy_status', toPlainOnly: true})
    policyStatus: boolean

    @IsString()
    @Expose({name: 'policy_name', toPlainOnly: true})
    policyName: string;

    @IsString()
    @Expose({name: 'policy_requirement', toPlainOnly: true})
    policyRequirement: string;

}

export class TotalSeverityResultsDto {

    @IsString()
    @Expose({name: 'namespace', toPlainOnly: true})
    namespace: string;

    @IsString()
    @Expose({name: 'imageUrl', toPlainOnly: true})
    imageUrl: string

    @IsString()
    @Expose({name: 'imageName', toPlainOnly: true})
    imageName: string

    @IsNumber()
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number;

    @IsNumber()
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number;

    @IsNumber()
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number;

    @IsNumber()
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number;

    @IsNumber()
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number;

}

export class TotalVulnerabilityResultsDto {
    @IsNumber()
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number;

    @IsNumber()
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number;

    @IsNumber()
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number;

    @IsNumber()
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number;

    @IsNumber()
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number;

    @IsString()
    @Expose({name: 'saved_date', toPlainOnly: true})
    savedDate: string;
}

export class QueryFilterDto {
    @IsOptional()
    @IsArray()
    stations?: string[];

    @IsNumber()
    criticalIssues: number;


}

export class ImageScanResultWithIssuesDto extends ImageScanResultsDto {
    @Type(() => ImageScanResultsIssueDto)
    issues: ImageScanResultsIssueDto[];
    encounterError: boolean;
}
