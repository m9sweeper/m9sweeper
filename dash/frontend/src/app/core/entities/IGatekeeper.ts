import {IKubernetesServiceObject} from './IKubernetesServiceObject';

// tslint:disable-next-line:no-empty-interface
export interface IGatekeeper extends IKubernetesServiceObject {
  constraintsCount?: number;
  enforced?: number;
}
