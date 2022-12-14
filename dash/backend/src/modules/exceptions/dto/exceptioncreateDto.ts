import {Expose} from "class-transformer";
import {IsOptional, IsString, ValidateIf} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ExceptionCreateDto {

    @Expose({name: 'title', toPlainOnly: true})
    @IsString()
    @ApiProperty({name: 'title'})
    title: string;

    @Expose({name: 'reason', toPlainOnly: true})
    @IsString()
    @ApiProperty({name: 'reason'})
    reason: string;

    @Expose({name: 'start_date', toPlainOnly: true})
    @IsString()
    @ApiProperty({name: 'startDate'})
    startDate: string;

    @Expose({name: 'end_date', toPlainOnly: true})
    // end date is optional, but its a Date field, so can't accept null
    @ValidateIf(o => o.endDate !== null)
    @IsString()
    @ApiProperty({name: 'endDate'})
    endDate: string;

    @Expose({name: 'status', toPlainOnly: true})
    @IsString()
    @ApiProperty({name: 'status'})
    status: string;

    @Expose({name: 'scanner_id', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'scannerId'})
    scannerId: number;

    @Expose({name: 'issue_identifier', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'issueIdentifier'})
    issueIdentifier: string;

    @Expose({name: 'relevant_for_all_policies', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'relevantForAllPolicies'})
    relevantForAllPolicies: boolean;

    @Expose({name: 'relevant_for_all_clusters', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'relevantForAllClusters'})
    relevantForAllClusters: boolean;

    @Expose({name: 'relevant_for_all_kubernetes_namespaces', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'relevantForAllKubernetesNamespaces'})
    relevantForAllKubernetesNamespaces: boolean;

    @IsOptional()
    @ApiProperty({name: 'clusters', type: Array(Number)})
    clusters: number[];

    @IsOptional()
    @ApiProperty({name: 'policies', type: Array(Number)})
    policies: number[];

    @IsOptional()
    @ApiProperty({name: 'namespaces', type: Array(Number)})
    namespaces: string[];

    @IsOptional()
    @ApiProperty({name: 'type'})
    type: string;

    @Expose({name: 'image_match', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'imageMatch'})
    imageMatch: string;

    @Expose({name: 'is_temp_exception', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'isTempException'})
    isTempException: boolean;

    @Expose({name: 'alternative_severity', toPlainOnly: true})
    @IsOptional()
    @ApiProperty({name: 'altSeverity'})
    altSeverity: string;
}
