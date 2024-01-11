/**
 * The tools that can be included in a security audit report
 * Should be kept synchronized with the backend enum
 * dash/backend/src/modules/security-audit-report/enums/security-audit-report-tools.ts
 */
export enum SecurityAuditReportTools {
  TRIVY = 'trivy',
  KUBESEC = 'kubesec',
  KUBEHUNTER = 'kubehunter',
  KUBEBENCH = 'kubebench'
}
