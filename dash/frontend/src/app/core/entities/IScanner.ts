export interface IScanner {
  id?: number;
  name: string;
  type: string;
  enabled: boolean;
  required: boolean;
  policyId: number;
  description: string;
  vulnerabilitySettings?: string | VulnerabilitySettings;
}

export interface VulnerabilitySettings {
  fixableCritical?: number;
  fixableMajor?: number;
  fixableNormal?: number;
  fixableLow?: number;
  fixableNegligible?: number;
  unFixableCritical?: number;
  unFixableMajor?: number;
  unFixableNormal?: number;
  unFixableLow?: number;
  unFixableNegligible?: number;
}

export interface ScannerData {
  scannerId: number;
  enabled: boolean;
  required: boolean;
}

export interface IScannerDialogData {
  isClose: boolean;
  value: IScanner;
}
