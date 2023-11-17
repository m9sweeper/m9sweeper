/**
 * The tools that can be included in a security audit report
 * Should be kept synchronized with the backend enum
 * dash/frontend/src/app/core/enum/SecurityAuditReportTools.ts
 */
export enum SecurityAuditReportTools {
  TRIVY = 'trivy',
  KUBESEC = 'kubesec'
}