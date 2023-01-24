
export interface IFalcoSettingPayload{
  clusterId: number;
  sendNotificationAnomaly: boolean;
  anomalyFrequency: number;
  severityLevel: string;
  sendNotificationSummary: boolean;
  summaryNotificationFrequency: string;
  weekday: string;
  whoToNotify: string;
  emailList: string;
}
