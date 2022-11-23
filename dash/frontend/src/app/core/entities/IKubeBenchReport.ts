export interface IKubeBenchReport {
  id: number;
  clusterId: number;
  /** Deprecated */
  uuid: string;
  resultsJson: IKubeBenchLog;
  resultsSummary: IKubeBenchSummary;
  createdAt?: number;
  superAdmin?: boolean; // not returned from db.
  // Added to enable mat-table data parsing for superAdmin in KubeBenchComponent
}

export interface IKubeBenchSummary {
  Totals: {
    total_pass: number;
    total_fail: number;
    total_warn: number;
    total_info: number;
  };
}

export interface IKubeBenchLog {
    Controls: IKubeBenchControl[];
    Totals: {
      total_pass: number,
      total_fail: number,
      total_warn: number,
      total_info: number,
  };
}

export interface IKubeBenchControl {
  id: string;
  version: string;
  detected_version: string;
  text: string;
  node_type: string;
  tests: IKubeBenchTest[];
  total_pass: number;
  total_fail: number;
  total_warn: number;
  total_info: number;
}

export interface IKubeBenchTest {
  section: string;
  type: string;
  pass: number;
  fail: number;
  warn: number;
  info: number;
  desc: string;
  results: {
    test_number: string;
    test_desc: string;
    audit: string;
    AuditEnv: string;
    AuditConfig: string;
    type: string;
    remediation: string;
    test_info: string[];
    status: string;
    actual_value: string;
    scored: boolean;
    isMultiple: boolean;
    expected_result: string;
  }[];
}

