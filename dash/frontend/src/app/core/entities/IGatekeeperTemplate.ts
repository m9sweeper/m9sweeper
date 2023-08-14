import {IGateKeeperConstraintDetails} from './IGateKeeperConstraint';

export interface MetaDataAnnotation {
    description?: string;
    'minesweeper.io/apiGroup'?: string;
    'minesweeper.io/kinds'?: string;
}

export interface TemplateMetaData {
  name?: string;
  annotations?: MetaDataAnnotation;
}

export interface TemplateCrd {
  spec: { names: { kind: string }}; // @TODO: refactor properly
}

export interface TemplateTarget {
  target?: string;
  rego?: string;
}

export interface TemplateSpec {
  crd?: TemplateCrd;
  targets?: TemplateTarget[];
}
export interface IGatekeeperTemplate {
  apiVersion?: string;
  kind?: string;
  metadata?: TemplateMetaData;
  spec?: TemplateSpec;
  constraintsCount?: number;
  enforced?: number;
}

export interface IGSelectedTemplate {
  selectedTemplate: IGateKeeperConstraintDetails;
  selectedTemplateName: string;
  selectedTopDir?: string;
  displayTemplateContent?: boolean;
  error?: string;
}
