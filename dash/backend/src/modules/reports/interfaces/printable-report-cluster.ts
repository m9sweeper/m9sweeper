import {IssueSeverityType} from '../../policy/enum/IssueSeverityType';

export interface PrCluster {
  id: number;
  name: string;
  trivy: PrTrivyReport;
}

export interface PrTrivyReport {
  clusterOverview: PrTrivyOverview;
  namespaceOverview: Map<string, PrTrivyOverview>;
  vulnerabilities: PrTrivyVulnerability[];

}

export interface PrTrivyOverview {
  total: number;
  critical: number;
  major: number;
  medium: number;
  low: number;
  clean: number;
}

export interface PrTrivyVulnerability {
  image: string;
  cve: string;
  severity: IssueSeverityType;
}

