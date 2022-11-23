export interface IException {
  title: string;
  reason: string;
  startDate: number;
  endDate: number;
  status: string;
  issueIdentifier: string;
  relevantForAllPolicies: boolean;
  relevantForAllKubernetesNamespaces: boolean;
  relevantForAllClusters: boolean;
  type: string;
  imageMatch?: string;
  isTempException: boolean;

  scanner: {
    name: string;
    id: number;
  };

  clusters: {
    name: string;
    id: number;
  }[];

  policies: {
    name: string;
    id: number;
  }[];

  namespaces: {
    name: string;
  }[];
}
