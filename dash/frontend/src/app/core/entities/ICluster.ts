export interface ICluster {
  id: number;
  name: string;
  ipAddress: string;
  port: number;
  apiKey: string;
  groupId: number;
  context: string;
  tags: any[];
  group?: {
    id: number;
    name: string;
  };
  isEnforcementEnabled?: boolean;
  isImageScanningEnforcementEnabled?: boolean;
  gracePeriodDays?: number;
}
