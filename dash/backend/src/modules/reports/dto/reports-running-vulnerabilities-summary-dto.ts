import { Expose, Transform } from "class-transformer";
import {IsNumber} from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class ReportsRunningVulnerabilitiesSummaryDto {
  @Expose({name: 'total_critical'})
  @IsNumber()
  @ApiProperty({name: 'totalCritical'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalCritical: number;

  @Expose({name: 'total_fixable_critical'})
  @IsNumber()
  @ApiProperty({name: 'totalFixableCritical'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalFixableCritical: number;

  @Expose({name: 'total_major'})
  @IsNumber()
  @ApiProperty({name: 'totalMajor'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalMajor: number;

  @Expose({name: 'total_fixable_major'})
  @IsNumber()
  @ApiProperty({name: 'totalFixableMajor'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalFixableMajor: number;

  @Expose({name: 'total_medium'})
  @IsNumber()
  @ApiProperty({name: 'totalMedium'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalMedium: number;

  @Expose({name: 'total_fixable_medium'})
  @IsNumber()
  @ApiProperty({name: 'totalFixableMedium'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalFixableMedium: number;

  @Expose({name: 'total_low'})
  @IsNumber()
  @ApiProperty({name: 'totalLow'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalLow: number;

  @Expose({name: 'total_fixable_low'})
  @IsNumber()
  @ApiProperty({name: 'totalFixableLow'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalFixableLow: number;

  @Expose({name: 'total_negligible'})
  @IsNumber()
  @ApiProperty({name: 'totalNegligible'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalNegligible: number;

  @Expose({name: 'total_fixable_negligible'})
  @IsNumber()
  @ApiProperty({name: 'totalFixableNegligible'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  totalFixableNegligible: number;

}
