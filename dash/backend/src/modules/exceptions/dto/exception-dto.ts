import {Expose, Type} from 'class-transformer';
import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsOptional, ValidateNested} from "class-validator";
import {ExceptionCluster, ExceptionNamespace, ExceptionPolicies, ExceptionScanner} from "./exceptionListDto";

export class ExceptionDto {

    @Expose({name: 'id', toPlainOnly: true})
    @IsOptional()
    id: number;

    @Expose({name: 'title', toPlainOnly: true})
    @IsOptional()
    title: string;

    @Expose({name: 'reason', toPlainOnly: true})
    @IsOptional()
    reason: string;

    @Expose({name: 'start_date', toPlainOnly: true})
    @IsOptional()
    startDate: Date;

    @Expose({name: 'end_date', toPlainOnly: true})
    @IsOptional()
    endDate: Date;

    @Expose({name: 'status', toPlainOnly: true})
    @IsOptional()
    status: string;

    @Expose({name: 'scanner_id', toPlainOnly: true})
    @IsOptional()
    scannerId: number;

    @Expose({name: 'issue_identifier', toPlainOnly: true})
    @IsOptional()
    issueIdentifier: string;

    @Expose({name: 'relevant_for_all_policies', toPlainOnly: true})
    @IsOptional()
    relevantForAllPolicies: boolean;

    @Expose({name: 'relevant_for_all_clusters', toPlainOnly: true})
    @IsOptional()
    relevantForAllClusters: boolean;

    @Expose({name: 'relevant_for_all_kubernetes_namespaces', toPlainOnly: true})
    @IsOptional()
    relevantForAllKubernetesNamespaces: boolean;

    @Expose({name: 'deleted_at', toPlainOnly: true})
    @IsOptional()
    deletedAt: number;

    @Expose({name: 'created_at', toPlainOnly: true})
    @IsOptional()
    createdAt: number;

    @Expose({name: 'created_by', toPlainOnly: true})
    @IsOptional()
    createdBy: number;

    @Expose({name: 'updated_by', toPlainOnly: true})
    @IsOptional()
    updatedBy: number;

    @Expose({name: 'deleted_by', toPlainOnly: true})
    @IsOptional()
    deletedBy: number;

    @Expose({name: 'type', toPlainOnly: true})
    @IsOptional()
    type: string;

    @Expose({name: 'image_match', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'imageMatch'})
    imageMatch: string;

    @Expose({name: 'is_temp_exception', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'isTempException'})
    isTempException: boolean;

    @Expose({ name: 'namespaces', toPlainOnly: true })
    @IsArray()
    @IsOptional()
    @Type(() => ExceptionNamespace)
    @ValidateNested({ each: true })
    namespaces: ExceptionNamespace[];

    @Expose({ name: 'policies', toPlainOnly: true })
    @IsArray()
    @Type(() => ExceptionPolicies)
    @ValidateNested({ each: true })
    policies: ExceptionPolicies[];

    @Expose({ name: 'clusters', toPlainOnly: true })
    @IsArray()
    @Type(() => ExceptionCluster)
    @ValidateNested({ each: true })
    clusters: ExceptionCluster[];

    @Expose({ name: 'scanner', toPlainOnly: true })
    @IsArray()
    @Type(() => ExceptionScanner)
    @ValidateNested({ each: true })
    scanner: ExceptionScanner[];

    @Expose({name: 'alternate_severity', toPlainOnly: true})
    @IsOptional()
    alternate_severity: string;
}

export class ExceptionQueryDto extends ExceptionDto {
    policyId: number;
}
