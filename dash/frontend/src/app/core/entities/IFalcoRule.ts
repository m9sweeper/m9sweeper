import {FalcoRuleAction} from '../enum/FalcoRuleAction';

export interface IFalcoRule {
  id?: number;
  action: FalcoRuleAction;
  namespace?: string;
  type?: string;
  image?: string;
}
