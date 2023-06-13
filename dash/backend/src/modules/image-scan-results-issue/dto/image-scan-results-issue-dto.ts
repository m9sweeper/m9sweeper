import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';


export class ImageScanResultsIssueDto {

    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty()
    @IsOptional()
    id: number;

    @Expose({name: 'image_results_id', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    imageResultsId: number;

    @Expose({name: 'scanner_id', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    scannerId: number;

    @Expose({name: 'name', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    name: string;

    @Expose({name: 'type', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    type: string;

    @Expose({name: 'severity', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    severity: string;

    @Expose({name: 'description', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    description: string;


    @Expose({name: 'is_compliant', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    isCompliant: boolean;

    @Expose({name: 'is_fixable', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    isFixable: boolean;

    @Expose({name: 'was_fixed', toPlainOnly: true})
    @IsOptional()
    @ApiProperty()
    wasFixed: boolean;

    @IsString()
    @IsOptional()
    @Expose({name: 'created_at', toPlainOnly: true})
    createdAt: number;

    @IsNumber()
    @IsOptional()
    @Expose({name: 'updated_at', toPlainOnly: true})
    updatedAt: number;

    @IsNumber()
    @IsOptional()
    @Expose({name: 'deleted_at', toPlainOnly: true})
    deletedAt: number;

    @IsString()
    @IsOptional()
    @Expose({name: 'package_name', toPlainOnly: true})
    packageName: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'installed_version', toPlainOnly: true})
    installedVersion: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'fixed_version', toPlainOnly: true})
    fixedVersion: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'compliance_reason', toPlainOnly: true})
    complianceReason: string;

    @IsString()
    @IsOptional()
    @Expose({name: 'vulnerability_desc_url', toPlainOnly: true})
    vulnerabilityDescUrl

    scannerName: string;

    extraData: any;
}
