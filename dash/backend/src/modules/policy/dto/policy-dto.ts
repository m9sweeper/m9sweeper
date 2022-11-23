import { Exclude, Expose, Transform, Type} from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';
import {IsString, IsOptional, IsArray, IsBoolean, IsNumber} from 'class-validator';
import { ScannerDto } from '../../scanner/dto/scanner-dto';

export class Scanner {
    @Expose({name: 'scanner_id',toPlainOnly: true})
    @ApiProperty({name: 'scannerId'})
    scannerId: number;

    @Expose({name: 'enabled',toPlainOnly: true})
    @ApiProperty({name: 'enabled'})
    enabled: boolean;

    @Expose({name: 'required',toPlainOnly: true})
    @ApiProperty({name: 'required'})
    required: boolean;
}

export class PolicyDto {

    id: number;

    @Expose({name: 'name', toPlainOnly: true})
    @ApiProperty({name: 'name'})
    @IsString()
    @IsOptional()
    name: string;

    @Expose({name: 'description', toPlainOnly: true})
    @ApiProperty({name: 'description'})
    @IsString()
    @IsOptional()
    description: string;

    @Expose({name: 'enabled', toPlainOnly: true})
    @ApiProperty({name: 'enabled'})
    @IsBoolean()
    @IsOptional()
    enabled: boolean;

    @Expose({name: 'enforcement', toPlainOnly: true})
    @ApiProperty({name: 'enforcement'})
    @IsBoolean()
    @IsOptional()
    enforcement: boolean;

    /**
     * The grace period (in days) for issues caught by this policy
     */
    @Expose({name: 'new_scan_grace_period', toPlainOnly: true})
    @ApiProperty({name: 'new_scan_grace_period'})
    @IsNumber()
    @IsOptional()
    newScanGracePeriod: number;

    /**
     * The grace period (in days) for this policy for issues caught in rescans of images
     */
    @Expose({name: 'rescan_grace_period', toPlainOnly: true})
    @ApiProperty({name: 'rescan_grace_period'})
    @IsNumber()
    @IsOptional()
    rescanGracePeriod: number;

    @Expose({name: 'relevant_for_all_clusters', toPlainOnly: true})
    @ApiProperty({name: 'relevant_for_all_clusters'})
    @IsNumber()
    @IsOptional()
    relevantForAllClusters: boolean;

    createdAt: number;
    updatedAt: number;
    deletedAt: number;

    @IsOptional()
    metadata: any;
}

export class PoliciesByClusterIdDto{
    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty({name: 'id'})
    @IsNumber()
    @IsOptional()
    id: number;

    @Expose({name: 'name', toPlainOnly: true})
    @ApiProperty({name: 'name'})
    @IsString()
    @IsOptional()
    name: string;

    @Expose({name: 'enabled', toPlainOnly: true})
    @ApiProperty({name: 'enabled'})
    @IsBoolean()
    @IsOptional()
    enabled: boolean;

    @Expose({name: 'enforcement', toPlainOnly: true})
    @ApiProperty({name: 'enforcement'})
    @IsBoolean()
    @IsOptional()
    enforcement: boolean;

    @Expose({name: 'scanners', toPlainOnly: true})
    @ApiProperty({name: 'scanners', type: [ScannerDto]})
    @IsArray()
    @Type(() => ScannerDto)
    scanners: ScannerDto[];

    createdAt: number;
    updatedAt: number;
    deletedAt: number;
    rescanGracePeriod: number;
    newScanGracePeriod: number;
}

export class PoliciesIdByCluster{
    @Expose({name: 'id', toPlainOnly: true})
    @ApiProperty({name: 'id'})
    @IsNumber()
    @IsOptional()
    id: number;

    @Expose({name: 'name', toPlainOnly: true})
    @ApiProperty({name: 'name'})
    @IsString()
    @IsOptional()
    name: string;

    @Expose({name: 'groupId', toPlainOnly: true})
    @ApiProperty({name: 'groupId'})
    @IsOptional()
    groupId: number;
}

export class PolicyExtendedDTO extends PolicyDto {
    @ApiProperty({name: 'tempExceptionEnabled'})
    @IsBoolean()
    @Exclude()
    tempExceptionEnabled: boolean;

    @ApiProperty({name: 'tempExceptionEnabled'})
    @IsBoolean()
    @Exclude()
    rescanEnabled: boolean;
}

export class PolicyScannerDto {
    @Expose({name: 'policy', toPlainOnly: true})
    @ApiProperty({name: 'policy', type: PolicyExtendedDTO})
    @IsOptional()
    @Type(() => PolicyExtendedDTO)
    @Transform(value => JSON.stringify(value), {toPlainOnly: true})
    policy: PolicyExtendedDTO;

    @Expose({name: 'scanners', toPlainOnly: true})
    @ApiProperty({name: 'scanners', type: [ScannerDto]})
    @IsArray()
    @IsOptional()
    @Type(() => ScannerDto)
    @Transform(value => JSON.stringify(value), {toPlainOnly: true})
    scanners: ScannerDto[];

    @IsArray()
    @IsOptional()
    @ApiProperty({name: 'clusters', type: [Number]})
    clusters: number[];
}

