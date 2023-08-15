import {IV1ObjectMeta} from './IKubernetesServiceObject';

export interface IGatekeeperConstraintTemplate {
  apiVersion: string;
  kind?: string;
  metadata?: IV1ObjectMeta;
  spec?: IConstraintTemplateSpec;
  status?: IConstraintTemplateStatus;
}

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

export interface IConstraintTemplateStatus {
  byPod?: {
    id?: string,
    observedGeneration?: number,
    operations?: string[],
    templateUID?: string,
  }[];
  created?: boolean;
}
