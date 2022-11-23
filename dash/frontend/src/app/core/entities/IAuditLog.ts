export interface IAuditLog {
  id: number;
  // userId: string;
  entityType?: string;
  eventType?: string;
  entityId?: number;
  data?: IMetaData;
  fullName?: string;
  createdAt: number;
}

interface IMetaData {
  pre?: any;
  post?: any;
  diff?: any;
  trace?: any;
  error?: any;
}
