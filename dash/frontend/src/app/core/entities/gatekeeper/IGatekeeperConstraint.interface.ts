import {IV1ObjectMeta} from '../kubernetesObjects';

export interface IGatekeeperConstraint {
  apiVersion: string;
  kind?: string;
  metadata?: IV1ObjectMeta;
  spec?: IConstraintSpec;
  status?: IConstraintStatus;
}

interface IConstraintSpec {
  enforcementAction?: string;
  match?: {
    excludedNamespaces?: string[];
    kinds?: {
      [key: string]: string[];
    }[]
  };
  parameters?: {
    cpu?: string;
    memory?: string;
  };
}

interface IConstraintStatus {
  auditTimestamp?: string;
  byPod?: {
    constraintUid?: string,
    enforced?: boolean,
    id?: string,
    observedGeneration?: number,
    operations?: string[],
  }[];
  totalViolations?: number;
  violations?: {
    enforcementAction?: string;
    kind?: string;
    message?: string;
    name?: string;
    namespace?: string;
  }[];
}
