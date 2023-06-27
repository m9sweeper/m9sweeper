import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional, Validate} from 'class-validator';
import {FalcoRuleAction} from '../enums/falco-rule-action';
import {RegexConstraint} from '../../../util/validator-constraints/regex-constraint';

export class FalcoRuleDto {
  @Expose({name: 'cluster_id', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  clusterId: number;

  @Expose({name: 'id', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  id: number;

  @Expose({name: 'created_at', toPlainOnly: true})
  @IsOptional()
  @IsNumber()
  createdAt: number;

  @Expose({name: 'deleted_at', toPlainOnly: true})
  @IsOptional()
  @IsNumber()
  deletedAt: number;

  @Expose({name: 'action', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  action: FalcoRuleAction;

  @Expose({name: 'namespace', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  namespace: string;

  @Expose({name: 'falco_rule', toPlainOnly: true})
  @IsOptional()
  @IsOptional()
  @Validate(RegexConstraint)
  falcoRule: string;

  @Expose({name: 'image', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  @Validate(RegexConstraint)
  image: string;
}