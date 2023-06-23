import {FalcoRuleAction} from '../enum/FalcoRuleAction';

export interface IFalcoRule {
  id?: number;
  clusterId: number;
  createdAt: number;
  action: FalcoRuleAction;
  namespace?: string;
  falcoRule?: string;
  image?: string;
}
