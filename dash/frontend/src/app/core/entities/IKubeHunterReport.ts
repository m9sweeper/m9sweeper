export interface IKubeHunterReport {
  id: number;
  clusterId: number;
  createdAt: number;
  date: string;
  /** Deprecated */
  uuid: string;
  nodes: any;
  services: any;
  vulnerabilities: any;
}

export interface IKubeHunterVulnerabilities {
  severity: string;
  category: string;
  vulnerabiltiy: string;
  description: string;
  location: string;
  avdUrl: string;
  vid: string;
}
