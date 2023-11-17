import {IssueSeverityType} from '../../policy/enum/IssueSeverityType';
import {PodIssueSummaryDto} from '../../image-scan-results-issue/dto/pod-issue-summary.dto';

export interface SecurityAuditTrivyReport {
  clusterOverview: SecurityAuditTrivyOverview;
  namespaces: Record<string, SecurityAuditTrivyNamespaceReport>;
  vulnerabilities: SecurityAuditTrivyVulnerability[];
}

export interface SecurityAuditTrivyIssueCount {
  critical: number;
  major: number;
  medium: number;
  low: number;
  negligible: number;
}

export interface SecurityAuditTrivyOverview extends SecurityAuditTrivyIssueCount {
  total: number;
  unscanned: number;
  clean: number;
}

export interface SecurityAuditTrivyPodOverview  extends SecurityAuditTrivyIssueCount {
  unscannedImages: number;
}

export interface SecurityAuditTrivyPod {
  overview: SecurityAuditTrivyPodOverview;
  issues: PodIssueSummaryDto[];
}

export interface SecurityAuditTrivyVulnerability {
  image: string;
  cve: string;
  severity: IssueSeverityType;
}

export interface SecurityAuditTrivyNamespaceReport {
  overview: SecurityAuditTrivyOverview;
  pods: Record<string, SecurityAuditTrivyPod>;
}

