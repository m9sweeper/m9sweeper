import {IGateKeeperConstraintDetails} from './IGateKeeperConstraint';
import {IGatekeeper} from './IGatekeeper';

/**
 * @deprecated - use IGatekeeper instead
 */
export interface MetaDataAnnotation {
    description?: string;
    'minesweeper.io/apiGroup'?: string;
    'minesweeper.io/kinds'?: string;
}

/**
 * @deprecated - use IGatekeeper instead
 */
export interface TemplateMetaData {
  name?: string;
  annotations?: MetaDataAnnotation;
}

/**
 * @deprecated - use IGatekeeper instead
 */
export interface TemplateCrd {
  spec: { names: { kind: string }}; // @TODO: refactor properly
}

/**
 * @deprecated - use IGatekeeper instead
 */
export interface TemplateTarget {
  target?: string;
  rego?: string;
}

/**
 * @deprecated - use IGatekeeper instead
 */
export interface TemplateSpec {
  crd?: TemplateCrd;
  targets?: TemplateTarget[];
}

/**
 * @deprecated - use IGatekeeper instead
 */
export interface IGatekeeperTemplate {
  apiVersion?: string;
  kind?: string;
  metadata?: TemplateMetaData;
  spec?: TemplateSpec;
  constraintsCount?: number;
  enforced?: number;
}
