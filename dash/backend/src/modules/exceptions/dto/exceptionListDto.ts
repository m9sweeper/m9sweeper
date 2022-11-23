import {Expose, Type} from 'class-transformer';
import {IsArray, ValidateNested} from "class-validator";

export class ExceptionListDto {
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @Expose({name: 'title', toPlainOnly: true})
    title: string;

    @Expose({name: 'start_date', toPlainOnly: true})
    start_date: number;

    @Expose({name: 'end_date', toPlainOnly: true})
    end_date: number;

    @Expose({name: 'status', toPlainOnly: true})
    status: string;
}


export class ExceptionNamespace{
    @Expose({name: 'name', toPlainOnly: true})
    name: string
}

export class ExceptionPolicies{
    @Expose({name: 'id', toPlainOnly: true})
    id: number

    @Expose({name: 'name', toPlainOnly: true})
    name: string
}

export class ExceptionCluster{
    @Expose({name: 'id', toPlainOnly: true})
    id: number

    @Expose({name: 'name', toPlainOnly: true})
    name: string
}

export class ExceptionScanner{
    @Expose({name: 'id', toPlainOnly: true})
    id: number

    @Expose({name: 'name', toPlainOnly: true})
    name: string
}

export class SingleExceptionDto{
    @Expose({name: 'id', toPlainOnly: true})
    id: number;

    @Expose({name: 'title', toPlainOnly: true})
    title: string;

    @Expose({name: 'start_date', toPlainOnly: true})
    start_date: number;

    @Expose({name: 'end_date', toPlainOnly: true})
    end_date: number;

    @Expose({name: 'status', toPlainOnly: true})
    status: string;

    @Expose({name: 'issue_identifier', toPlainOnly: true})
    issueIdentifier: string;

    @Expose({name: 'relevant_for_all_policies', toPlainOnly: true})
    relevantForAllPolicies: string;

    @Expose({name: 'relevant_for_all_clusters', toPlainOnly: true})
    relevantForAllClusters: string;

    @Expose({name: 'relevant_for_all_kubernetes_namespaces', toPlainOnly: true})
    relevantForAllKubernetesNamespaces: string;

    @Expose({name: 'is_temp_exception', toPlainOnly: true})
    isTempException: boolean;

    @Expose({ name: 'namespaces', toPlainOnly: true })
    @IsArray()
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
}
