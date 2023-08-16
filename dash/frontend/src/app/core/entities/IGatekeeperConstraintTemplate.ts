import {IV1ObjectMeta} from './kubernetesObjects';

/**
 * @deprecated
 */
export interface IGatekeeperConstraintTemplate {
  apiVersion: string;
  kind?: string;
  metadata?: IV1ObjectMeta;
  spec?: IConstraintTemplateSpec;
  status?: IConstraintTemplateStatus;
}

/**
 * @deprecated
 */
export interface IConstraintTemplateSpec {
  crd?: {
    spec?: {
      names?: {
        kind?: string,
      },
      validation?: any,
    }
  };
  targets?: {
    rego?: string,
    target?: string,
  }[];
}

/**
 * @deprecated
 */
export interface IConstraintTemplateStatus {
  byPod?: {
    id?: string,
    observedGeneration?: number,
    operations?: string[],
    templateUID?: string,
  }[];
  created?: boolean;
}
