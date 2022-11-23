import {IGatekeeperConstraintViolation} from './IGateKeeperConstraint';

export interface IPod {
  id: number;
  name: string;
  selfLink: string;
  uid: string;
  clusterId: number;
  resourceVersion: string;
  namespace: string;
  generateName: string;
  creationTimestamp: bigint;
  compliant: boolean;
  violations?: IGatekeeperConstraintViolation[];
}
