import {FalcoRuleAction} from '../enum/FalcoRuleAction';

export interface IFalcoRule {
  id?: number;
  clusterId: number;
  createdAt: number;
  action: FalcoRuleAction;
  allNamespaces: boolean;
  allClusters: boolean;
  falcoRule?: string;
  image?: string;
  namespaces: IFalcoRuleNamespace[];
  clusters: IFalcoRuleCluster[];
}

export interface IFalcoRuleNamespace {
  namespace: string;
}

export interface IFalcoRuleCluster {
  clusterId: number;
  name?: string;
}
