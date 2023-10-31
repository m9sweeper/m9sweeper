import {IssueSeverityType} from '../../policy/enum/IssueSeverityType';

export interface PrCluster {
  id: number;
  name: string;
  trivy: PrTrivyReport;
}

export interface PrTrivyReport {
  clusterOverview: PrTrivyOverview;
  namespaces: Record<string, PrTrivyNamespaceReport>;
  vulnerabilities: PrTrivyVulnerability[];
}

export interface PrTrivyIssueCount {
  critical: number;
  major: number;
  medium: number;
  low: number;
  negligible: number;
}

export interface PrTrivyOverview extends PrTrivyIssueCount {
  total: number;
  unscanned: number;
  clean: number;
}

export interface PrTrivyPod {
  overview: PrTrivyIssueCount;
  issues: any[];
}

export interface PrTrivyVulnerability {
  image: string;
  cve: string;
  severity: IssueSeverityType;
}

export interface PrTrivyNamespaceReport {
  overview: PrTrivyOverview;
  pods: Record<string, PrTrivyPod>;
}

