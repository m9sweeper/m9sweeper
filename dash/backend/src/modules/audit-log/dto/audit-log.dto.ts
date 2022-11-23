import { Expose } from 'class-transformer';
import {IsJSON, IsNumber, IsOptional, IsString} from 'class-validator';

export class AuditLogDto {
    @Expose()
    @IsOptional()
    @IsNumber()
    id: number;

    @Expose({name: 'entity_type', toPlainOnly: true})
    @IsOptional()
    @IsString()
    entityType: string;

    @Expose({name: 'event_type', toPlainOnly: true})
    @IsOptional()
    @IsString()
    eventType: string;

    @Expose({name: 'entity_id', toPlainOnly: true})
    @IsOptional()
    @IsNumber()
    entityId: number;

    @Expose({name: 'user_id', toPlainOnly: true})
    @IsOptional()
    @IsNumber()
    userId: number;

    @Expose()
    @IsJSON()
    @IsOptional()
    data: any;

    @IsOptional()
    type: string;

    @Expose({name: 'organization_id', toPlainOnly: true})
    @IsNumber()
    @IsOptional()
    organizationId: number;

    @Expose({name: 'full_name', toClassOnly: true, toPlainOnly: false})
    @IsOptional()
    @IsString()
    fullName: string;

    @Expose({name: 'created_at', toPlainOnly: true})
    @IsOptional()
    @IsString()
    createdAt: number;

}

