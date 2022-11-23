import {IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Expose, Type} from 'class-transformer';
import {ScanImageIssue} from './image-result.dto';
import {ApiProperty} from '@nestjs/swagger';

export class ImageTrawlerResultDto {

    @IsString()
    @ApiProperty({name: 'summary'})
    @Expose({name: 'summary', toPlainOnly:true})
    summary: string;

    @IsNumber()
    @ApiProperty({name: 'criticalIssues'})
    @Expose({name: 'critical_issues', toPlainOnly:true})
    criticalIssues: number;

    @IsNumber()
    @ApiProperty({name: 'majorIssues'})
    @Expose({name:'major_issues', toPlainOnly:true})
    majorIssues: number;

    @IsNumber()
    @ApiProperty({name: 'mediumIssues'})
    @Expose({name: 'medium_issues', toPlainOnly:true})
    mediumIssues: number;

    @IsNumber()
    @ApiProperty({name: 'lowIssues'})
    @Expose({name:'low_issues', toPlainOnly:true})
    lowIssues: number;

    @IsNumber()
    @ApiProperty({name: 'negligibleIssues'})
    @Expose({name: 'negligible_issues', toPlainOnly:true})
    negligibleIssues: number;

    @IsBoolean()
    @IsOptional()
    @ApiProperty({name: 'encounterError'})
    @Expose({name: 'encounter_error', toPlainOnly:true})
    encounterError: boolean;

    @IsNumber()
    @IsOptional()
    @ApiProperty({name: 'startedAt'})
    @Expose({name: 'started_at', toPlainOnly:true})
    startedAt: number;

    @IsNumber()
    @IsOptional()
    @ApiProperty({name: 'finishedAt'})
    @Expose({name: 'finished_at', toPlainOnly:true})
    finishedAt: number;

    @IsNumber()
    @ApiProperty({name: 'policyId'})
    @Expose({name: 'policy_id', toPlainOnly: true})
    policyId: number;

    @IsOptional()
    @IsBoolean()
    @ApiProperty({name: 'policyStatus'})
    @Expose({name: 'policy_status', toPlainOnly:true})
    policyStatus: boolean;

    @IsOptional()
    @IsString()
    @ApiProperty({name: 'imageHash'})
    @Expose({name: 'docker_image_id', toPlainOnly: true})
    imageHash: string;


    @Expose({ name: 'issues', toPlainOnly: true })
    @ApiProperty({name: 'issues', type: [ScanImageIssue]})
    @IsArray()
    @Type(() => ScanImageIssue)
    @ValidateNested({ each: true })
    issues: ScanImageIssue[];
}

export class TrawlerScanResults {
    @ApiProperty()
    @ApiProperty({name: 'data', type: [ImageTrawlerResultDto]})
    @Type(() => ImageTrawlerResultDto)
    @ValidateNested({ each: true })
    data: ImageTrawlerResultDto[];

}
