import {Expose} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional, Validate} from 'class-validator';
import {FalcoRuleAction} from '../enums/falco-rule-action';
import {RegexConstraint} from '../../../util/validator-constraints/regex-constraint';

class FalcoRuleBaseDto {
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

  @Expose({name: 'all_clusters', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  allClusters: boolean;

  @Expose({name: 'all_namespaces', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  allNamespaces: boolean;
}

export class FalcoRuleDto extends FalcoRuleBaseDto {
  @ApiProperty()
  @IsOptional()
  /** Array of names of namespaces joined to this exception through the falco_rules_namespaces table */
  namespaces: FalcoRuleNamespaceDto[];

  @ApiProperty()
  @IsOptional()
  /** cluster ids & names retrieved using falco_rules_clusters table */
  clusters: FalcoRuleClusterDto[];
}

/** Used for submitting from the frontend for creating & updating the dto */
export class FalcoRuleCreateDto extends FalcoRuleBaseDto {
  @ApiProperty()
  @IsOptional()
  /** namespace names as strings */
  namespaces: string[];

  @ApiProperty()
  @IsOptional()
  /** cluster ids */
  clusters: string[];
}

/** Represents information from faco_rules_cluster table */
export class FalcoRuleClusterDto {

  @Expose({name: 'cluster_id', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  clusterId: number;

  @Expose({name: 'name', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  /** Not actually stored in table, added to DTO for convenience */
  name: string;
}

export class FalcoRuleNamespaceDto {
  @Expose({name: 'namespace', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  namespace: string;
}
