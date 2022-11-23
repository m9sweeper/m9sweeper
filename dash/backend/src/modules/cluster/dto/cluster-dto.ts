import {Expose, Type} from 'class-transformer';
import {ApiProperty} from '@nestjs/swagger';
import {IsBoolean, IsJSON, IsNumber, IsOptional, IsString} from 'class-validator';
import {Authority} from '../../user/enum/Authority';

export class Tag {
  name: string;
  id: number;
}

export class ClusterDto {

  @Expose({name: 'id', toPlainOnly: true})
  @ApiProperty()
  @IsOptional()
  id: number;

  @Expose({name: 'name', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  name: string;

  @Expose({name: 'ip_address', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  ipAddress: string;

  @Expose({name: 'port', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  port: string;

  @Expose({name: 'context', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  context: string;

  @Expose({name: 'group_id', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  groupId: number;

  @Expose({name: 'tags', toPlainOnly: true})
  @IsOptional()
  @ApiProperty()
  @Type(() => Tag)
  tags: Tag[];

  // @Exclude({toPlainOnly: true})


  // @Expose({name: 'kube_config', toPlainOnly: true})
  // @Expose({name: 'kube_config', toPlainOnly: true, groups: [Authority.ADMIN, Authority.SUPER_ADMIN]})
  @Expose({name: 'kube_config', toPlainOnly: true })
  @IsOptional()
  @ApiProperty()
  kubeConfig: string;

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

  @IsNumber()
  @IsOptional()
  @Expose({name: 'last_scanned_at', toPlainOnly: true})
  lastScannedAt: number;

  @IsString()
  @IsOptional()
  installWebhook: string;

  @IsBoolean()
  @IsOptional()
  @Expose({name: 'is_enforcement_enabled', toPlainOnly: true})
  @ApiProperty()
  isEnforcementEnabled: boolean;

  @IsBoolean()
  @IsOptional()
  @Expose({name: 'is_image_scanning_enforcement_enabled', toPlainOnly: true})
  @ApiProperty()
  isImageScanningEnforcementEnabled: boolean;

  @IsNumber()
  @IsOptional()
  @Expose({name: 'grace_period_days', toPlainOnly: true})
  gracePeriodDays: number;

  // @Expose()
  @IsOptional()
  metadata: any;
}
