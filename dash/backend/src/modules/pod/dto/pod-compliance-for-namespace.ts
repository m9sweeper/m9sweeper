import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PodComplianceForNamespace {
  @Expose({name: 'num_pods'})
  @IsNumber()
  @ApiProperty({name: 'numPods'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  numPods: number;

  @Expose({name: 'num_compliant_pods'})
  @IsNumber()
  @ApiProperty({name: 'numCompliantPods'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  numCompliantPods: number;

  @Expose({name: 'num_noncompliant_pods'})
  @IsNumber()
  @ApiProperty({name: 'numNoncompliantPods'})
  @Transform(params => parseFloat(params.value), { toClassOnly: true })
  numNoncompliantPods: number;

  @Expose({name: 'cluster_id'})
  @IsString()
  @ApiProperty({name: 'clusterId'})
  clusterId: number;

  @Expose({name: 'namespace'})
  @IsNumber()
  @ApiProperty({name: 'namespace'})
  namespace: string;
}
