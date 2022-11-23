import {Expose, Type} from 'class-transformer';
import {IsBoolean, IsNumber, IsOptional, IsString} from 'class-validator';
import {ApiProperty} from '@nestjs/swagger';

export class ScanImageIssue{
    @IsNumber()
    @ApiProperty({name: 'scannerId'})
    @Expose({name:'scanner_id', toPlainOnly:true})
    scannerId: number;

    @IsString()
    @ApiProperty({name: 'scannerName'})
    @Expose({name:'scanner_name', toPlainOnly:true})
    scannerName: string;

    @IsString()
    @ApiProperty({name: 'name'})
    @Expose({name:'name', toPlainOnly:true})
    name: string;

    @IsString()
    @ApiProperty({name: 'type'})
    @Expose({name:'type', toPlainOnly:true})
    type: string;

    @IsString()
    @ApiProperty({name: 'vulnerabilityDescUrl'})
    @Expose({name:'vulnerability_desc_url', toPlainOnly:true})
    vulnerabilityDescUrl: string;

    @IsString()
    @ApiProperty({name: 'severity'})
    @Expose({name:'severity', toPlainOnly:true})
    severity: string;

    @IsString()
    @ApiProperty({name: 'description'})
    @Expose({name:'description', toPlainOnly:true})
    description: string;

    @IsBoolean()
    @ApiProperty({name: 'isCompliant'})
    @Expose({name:'is_compliant', toPlainOnly:true})
    isCompliant: boolean;

    @IsBoolean()
    @ApiProperty({name: 'isFixable'})
    @Expose({name:'is_fixable', toPlainOnly:true})
    isFixable: boolean;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({name: 'wasFixed'})
    @Expose({name:'was_fixed', toPlainOnly:true})
    wasFixed: boolean;

    @IsString()
    @ApiProperty({name: 'data'})
    @Expose({name:'data', toPlainOnly:true})
    data: string;

    @IsString()
    @IsOptional()
    @ApiProperty({name: 'complianceReason'})
    @Expose({name:'compliance_reason', toPlainOnly:true})
    complianceReason: string;
}

// export class ScanImageResultDto {
//
//     @IsNumber()
//     @Expose({name: 'critical_issues', toPlainOnly:true})
//     criticalIssues: number;
//
//     @IsNumber()
//     @Expose({name:'major_issues', toPlainOnly:true})
//     majorIssues: number;
//
//     @IsNumber()
//     @Expose({name: 'medium_issues', toPlainOnly:true})
//     mediumIssues: number;
//
//     @IsNumber()
//     @Expose({name:'low_issues', toPlainOnly:true})
//     lowIssues: number;
//
//     @IsNumber()
//     @Expose({name: 'negligible_issues', toPlainOnly:true})
//     negligibleIssues: number;
//
//     @IsOptional()
//     @IsString()
//     @Expose({name: 'scanner_name', toPlainOnly:true})
//     scannerName: string;
//
//     @IsNumber()
//     @Expose({name: 'image_id', toPlainOnly:true})
//     imageId: number;
//
//     @IsOptional()
//     @IsString()
//     @Expose({name: 'summary', toPlainOnly:true})
//     summary: string;
//
//     @IsOptional()
//     @IsString()
//     @Expose({name: 'scan_results', toPlainOnly:true})
//     scanResult: string;
//
//     @Expose({ name: 'issues', toPlainOnly: true })
//     @Type(() => ScanImageIssue)
//     issues: ScanImageIssue
// }

export class ListOfImagesDto{

    @IsNumber()
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @IsString()
    @Expose({ name: 'url', toPlainOnly:true })
    url: string;

    @IsString()
    @Expose({name: 'name', toPlainOnly:true})
    name: string

    @IsString()
    @Expose({name: 'tag', toPlainOnly:true})
    tag: string;

    @IsString()
    @Expose({name: 'docker_image_id', toPlainOnly: true})
    dockerImageId: string;

    @IsNumber()
    @Expose({name: 'cluster_id', toPlainOnly: true})
    clusterId: number;

    @IsString()
    @Expose({name:'summary', toPlainOnly:true})
    summary:string;

    @IsOptional()
    @IsBoolean()
    @Expose({name: 'running_in_cluster', toPlainOnly:true})
    runningInCluster: boolean;

    @IsNumber()
    @Expose({name: 'last_scanned', toPlainOnly: true})
    lastScanned: number;

    @Expose({name:'scan_results', toPlainOnly: true})
    scanResults: string;

}

export class ImageResultDto {
    @Expose({ name: 'listOfImages', toPlainOnly: true })
    @Type(() => ListOfImagesDto)
    listOfImages: ListOfImagesDto;

    @IsNumber()
    @Expose({name: 'total', toPlainOnly: true})
    total: number;

}
