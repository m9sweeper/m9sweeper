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

export interface PrTrivyOverview {
  total: number;
  critical: number;
  major: number;
  medium: number;
  low: number;
  negligible: number;
  unscanned: number;
  clean: number;
}

export interface PrTrivyVulnerability {
  image: string;
  cve: string;
  severity: IssueSeverityType;
}

export interface PrTrivyNamespaceReport {
  overview: PrTrivyOverview;
  pods: Record<string, PrTrivyOverview>;
}

