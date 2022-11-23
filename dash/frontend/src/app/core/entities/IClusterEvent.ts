export interface IClusterEvent {
  id: number;
  type: string;
  level: string;
  description: string;
  data: any;
  organizationId: number;
  entityId: number;
  entityType: string;
  createdDate: number;
}
