export interface IImageScanResultIssue {
  id: number;
  imageResultsId: number;
  scannerId: number;
  scannerName: string;
  name: string;
  type: string;
  vulnerabilityDescUrl: string;
  severity: string;
  description: string;
  isCompliant: boolean;
  isFixable: boolean;
  wasFixed: boolean;
  extraData: {
    [key: string]: any;
  };
  packageName: string;
  installedVersion: string;
  fixedVersion: string;
}
