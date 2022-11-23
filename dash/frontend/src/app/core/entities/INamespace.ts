export interface IKubernetesImagesName{
  name: string;
}

export interface INamespace{
  id: number;
  name: string;
  selfLink: string;
  uid: string;
  clusterId: number;
  resourceVersion: string;
  creationTimestamp: bigint;
  compliant: boolean;
  kubernetesImages: number;
  kubernetesPods: number;
  clusterName?: string;
}
