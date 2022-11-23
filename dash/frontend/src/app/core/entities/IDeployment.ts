export interface IDeployment {
  id: number;
  name: string;
  selfLink: string;
  uid: string;
  resourceVersion: string;
  namespace: string;
  generation: number;
  clusterId: number;
  creationTimestamp: bigint;
  compliant: boolean;
}
