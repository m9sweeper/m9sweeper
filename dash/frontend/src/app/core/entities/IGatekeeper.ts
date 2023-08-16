import {IKubernetesServiceObject} from './kubernetesObjects';

/**
 * @deprecated - use IGatekeeperConstraintTemplate in the gatekeeper folder
 */
export interface IGatekeeper extends IKubernetesServiceObject {
  constraintsCount?: number;
  enforced?: number;
}
