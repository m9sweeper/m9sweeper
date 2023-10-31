import {Expose} from 'class-transformer';
import {IsString} from 'class-validator';

export class PodIssueSummaryDto {
  @Expose({name: 'image'})
  @IsString()
  image: string;

  @Expose({name: 'severity'})
  @IsString()
  severity: string;

  @Expose({name: 'cve'})
  @IsString()
  cve: string;
}