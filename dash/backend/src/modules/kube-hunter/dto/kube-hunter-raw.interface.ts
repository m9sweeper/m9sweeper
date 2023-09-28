export interface IKubeHunterRawNodes extends IKubeHunterRawResponseSection {
  value: IKHRawResponseNodes;
}
export interface IKubeHunterRawServices extends IKubeHunterRawResponseSection {
  value: IKHRawResponseServices;
}
export interface IKubeHunterRawVulnerabilities extends IKubeHunterRawResponseSection {
  value: IKHRawResponseVulnerabilities;
}

interface IKubeHunterRawResponseSection {
  value: IKHRawResponseNodes | IKHRawResponseServices | IKHRawResponseVulnerabilities;
  key: string;
  obj: IKHRawResponseRawObj;
  type: number;
  options: IKHRawResponseOptions;
}

interface IKHRawResponseNodes {
  value: IKHRawResponseNode[]
  key: string
  obj: IKHRawResponseObjDefinition
  type: number
  options: IKHRawResponseOptions
}

interface IKHRawResponseServices {
  value: IKHRawResponseService[]
  key: string
  obj: IKHRawResponseObjDefinition
  type: number
  options: IKHRawResponseOptions
}

interface IKHRawResponseVulnerabilities {
  value: IKHRawResponseVulnerability[]
  key: string
  obj: IKHRawResponseObjDefinition
  type: number
  options: IKHRawResponseOptions
}

interface IKHRawResponseObjDefinition {
  nodes: IKHRawResponseNode[]
  services: IKHRawResponseService[]
  vulnerabilities: IKHRawResponseVulnerability[]
  uuid: string
  clusterId: number
}

interface IKHRawResponseNode {
  type: string
  location: string
}

interface IKHRawResponseService {
  service: string
  location: string
}

interface IKHRawResponseVulnerability {
  location: string
  vid: string
  category: string
  severity: string
  vulnerability: string
  description: string
  evidence: string
  avd_reference: string
  hunter: string
}

interface IKHRawResponseOptions {
  enableCircularCheck: boolean
  enableImplicitConversion: boolean
  excludeExtraneousValues: boolean
  exposeDefaultValues: boolean
  exposeUnsetFields: boolean
  ignoreDecorators: boolean
}

interface IKHRawResponseRawObj {
  id: number
  cluster_id: number
  created_at: string
  uuid: string
  nodes: IKHRawResponseNodes
  services: IKHRawResponseServices
  vulnerabilities: IKHRawResponseVulnerabilities
}
