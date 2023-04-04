export interface IFalcoLog {
  id: number;
  clusterId: number;
  timestamp: string;
  calendarDate: string;
  anomalySignature: string;
  anomalySignatureGlobal: string;
  rule: string;
  namespace: string;
  image: string;
  container: string;
  level: string;
  raw: object;
  message: string;
  fields: object;
}
