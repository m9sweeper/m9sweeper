export interface IPolicy {
  id: number;
  name: string;
  description: string;
  required: boolean;
  enforcement: boolean;
  newScanGracePeriod: number;
  rescanGracePeriod: number;
  clusterId: number;
}
