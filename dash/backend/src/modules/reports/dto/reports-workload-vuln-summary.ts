import {Expose, Transform} from 'class-transformer';
import {IsNumber, IsString} from 'class-validator';

export class ReportsWorkloadVulnSummary {
  @Expose({ name: 'name' })
  @IsString()
  name: string;

  @Expose({ name: 'images' })
  @IsString()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  images: number;

  @Expose({name: 'criticalIssues'})
  @IsNumber()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  criticalIssues: number;

  @Expose({name: 'majorIssues'})
  @IsNumber()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  majorIssues: number;

  @Expose({name: 'mediumIssues'})
  @IsNumber()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  mediumIssues: number;

  @Expose({name: 'lowIssues'})
  @IsNumber()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  lowIssues: number;

  @Expose({name: 'negligibleIssues'})
  @IsNumber()
  @Transform(params => parseInt(params.value), { toClassOnly: true })
  negligibleIssues: number;

}