import {Content, TableCell} from 'pdfmake/interfaces';

export interface SecurityAuditReportCluster {
  name: string;
  id: number;
  toolResults: Record<string, SecurityAuditReportToolResults>;
}

export interface SecurityAuditReportToolResults {
  summaryRow: TableCell[];
  content: Content;
}