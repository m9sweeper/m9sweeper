import { ApiProperty } from '@nestjs/swagger';
import {Expose, Transform, Type} from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class VulnerabilitySettingsDto {

    @IsNumber()
    fixableCritical: number;

    @IsNumber()
    fixableMajor: number;

    @IsNumber()
    fixableNormal: number;

    @IsNumber()
    fixableLow: number;

    @IsNumber()
    fixableNegligible: number;

    @IsNumber()
    unFixableCritical: number;

    @IsNumber()
    unFixableMajor: number;

    @IsNumber()
    unFixableNormal: number;

    @IsNumber()
    unFixableLow: number;

    @IsNumber()
    unFixableNegligible: number;

}

export class ScannerDto {

    @ApiProperty()
    id: number;

    @Expose({name: 'name', toPlainOnly: true})
    @ApiProperty()
    @IsString()
    @IsOptional()
    name: string;

    @Expose({name: 'type', toPlainOnly: true})
    @ApiProperty()
    @IsString()
    @IsOptional()
    type: string;

    @Expose({name: 'enabled', toPlainOnly: true})
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    enabled: boolean;

    @Expose({name: 'required', toPlainOnly: true})
    @ApiProperty()
    @IsBoolean()
    @IsOptional()
    required: boolean;

    @Expose({name: 'policy_id', toPlainOnly: true})
    @IsNumber()
    policyId: number;

    @Expose({name: 'description', toPlainOnly: true})
    @IsString()
    @IsOptional()
    description: string;

    @Expose({name: 'vulnerability_settings', toPlainOnly: true})
    @Type((type) => VulnerabilitySettingsDto)
    // @Transform(value => JSON.stringify(value), {toPlainOnly: true})
    @IsOptional()
    vulnerabilitySettings: VulnerabilitySettingsDto;

    createdAt: number;
    updatedAt: number;
    deletedAt: number;
}
