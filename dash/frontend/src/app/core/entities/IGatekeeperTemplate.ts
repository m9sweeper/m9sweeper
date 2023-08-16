/**
 * @deprecated
 */
export interface MetaDataAnnotation {
    description?: string;
    'minesweeper.io/apiGroup'?: string;
    'minesweeper.io/kinds'?: string;
}

/**
 * @deprecated
 */
export interface TemplateMetaData {
  name?: string;
  annotations?: MetaDataAnnotation;
}

/**
 * @deprecated
 */
export interface TemplateCrd {
  spec: { names: { kind: string }}; // @TODO: refactor properly
}

/**
 * @deprecated
 */
export interface TemplateTarget {
  target?: string;
  rego?: string;
}

/**
 * @deprecated
 */
export interface TemplateSpec {
  crd?: TemplateCrd;
  targets?: TemplateTarget[];
}

/**
 * @deprecated
 */
export interface IGatekeeperTemplate {
  apiVersion?: string;
  kind?: string;
  metadata?: TemplateMetaData;
  spec?: TemplateSpec;
  constraintsCount?: number;
  enforced?: number;
}
