export interface ImagesAndCount {
  total: number;
  listOfImages: IImage[];
}
export interface IScanResult{
  id: number;
  scannerName: string;
  scanResult: string;
  criticalIssues: number;
  majorIssues: number;
  mediumIssues: number;
  lowIssues: number;
  negligibleIssues: number;
  issues: Issues;
  createdAt: number;
  updatedAt: number;
}
export interface Issues{
  id: string;
  title: string;
  description: string;
  level: string;
  data: string;
}

export interface IImage {
  id: number;
  url: string;
  name: string;
  tag: string;
  dockerImageId: string;
  clusterId: number;
  summary: string;
  lastScanned: string;
  runningInCluster: boolean;
  scanResults: string;
  scanQueued?: boolean;
  criticalIssues?: number;
  majorIssues?: number;
  mediumIssues?: number;
  lowIssues?: number;
  negligibleIssues?: number;
}

export interface IImageScanData{
  criticalIssues: number;
  encounterError: boolean;
  finishedAt: string;
  id: number;
  imageId: number;
  lowIssues: number;
  majorIssues: number;
  mediumIssues: number;
  negligibleIssues: number;
  policyId: number;
  policyName: string;
  policyRequirement: boolean;
  policyStatus: boolean;
  scanResults: string;
  scannerName: string;
  startedAt: string;
  summary: string;
}

export interface IImageScanCount {
  count: number;
  date: string;
}
