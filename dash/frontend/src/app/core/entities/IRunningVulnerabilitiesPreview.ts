export interface IRunningVulnerabilities {
  imageId: number;
  image: string;
  namespaces: string[];
  scanResults: string;
  lastScanned: string;
  totalCritical: number;
  totalMajor: number;
  totalMedium: number;
  totalLow: number;
  totalNegligible: number;
  totalFixableCritical: number;
  totalFixableMajor: number;
  totalFixableMedium: number;
  totalFixableLow: number;
  totalFixableNegligible: number;
}

export interface IRunningVulnerabilitiesPreview {
  count: number;

  results: IRunningVulnerabilities[];
}

export interface IHistoricalVulnerabilities {
  savedDate: number;
  totalCritical: number;
  totalMajor: number;
  totalMedium: number;
  totalLow: number;
  totalNegligible: number;
  totalFixableCritical: number;
  totalFixableMajor: number;
  totalFixableMedium: number;
  totalFixableLow: number;
  totalFixableNegligible: number;
}

export interface IHistoricalVulnerabilitiesPreview {
  count: number;

  results: IHistoricalVulnerabilities[];
}
