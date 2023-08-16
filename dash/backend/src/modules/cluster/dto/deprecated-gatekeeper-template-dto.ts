import {IsOptional} from "class-validator";
import {Exclude, Expose, Type} from "class-transformer";

@Exclude()
export class MetaDataAnnotation{
    @IsOptional()
    @Expose()
    description: string;

    @IsOptional()
    @Expose()
    'minesweeper.io/apiGroup': string;

    @IsOptional()
    @Expose()
    'minesweeper.io/kinds': string;
}

@Exclude()
export class TemplateTarget {
    @IsOptional()
    @Expose()
    target: string;

    @IsOptional()
    @Expose()
    rego: string;
}

@Exclude()
export class TemplateCrd {
    @IsOptional()
    @Expose()
    spec: { names: { kind: string }}; // @TODO: refactor properly
}

@Exclude()
export class TemplateSpec {
    @IsOptional()
    @Expose()
    @Type(() => TemplateCrd)
    crd: TemplateCrd;

    @IsOptional()
    @Expose()
    @Type(() => TemplateTarget)
    targets: TemplateTarget[];
}

@Exclude()
export class TemplateMetaData{
    @IsOptional()
    @Expose()
    name: string;

    @IsOptional()
    @Expose()
    @Type(() => MetaDataAnnotation)
    annotations: MetaDataAnnotation;
}

@Exclude()
export class DeprecatedGatekeeperTemplateDto {
    @IsOptional()
    @Expose()
    apiVersion: string;

    @IsOptional()
    @Expose()
    kind: string;

    @IsOptional()
    @Expose()
    @Type(() => TemplateMetaData)
    metadata: TemplateMetaData;

    @IsOptional()
    @Expose()
    @Type(() => TemplateSpec)
    spec: TemplateSpec;

    @IsOptional()
    @Expose()
    constraintsCount: number;

    @IsOptional()
    @Expose()
    enforced: boolean;
}
