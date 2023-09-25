export interface IKubeHunterRawNodes extends IKubeHunterRawResponseSection {
  value: Nodes;
}
export interface IKubeHunterRawServices extends IKubeHunterRawResponseSection {
  value: Services;
}
export interface IKubeHunterRawVulnerabilities extends IKubeHunterRawResponseSection {
  value: Vulnerabilities;
}

interface IKubeHunterRawResponseSection {
  value: Nodes | Services | Vulnerabilities;
  key: string;
  obj: RawObj;
  type: number;
  options: Options;
}

interface Nodes {
  value: Node[]
  key: string
  obj: ObjDefinition
  type: number
  options: Options
}

interface Services {
  value: Service[]
  key: string
  obj: ObjDefinition
  type: number
  options: Options
}

interface Vulnerabilities {
  value: Vulnerability[]
  key: string
  obj: ObjDefinition
  type: number
  options: Options
}

interface ObjDefinition {
  nodes: Node[]
  services: Service[]
  vulnerabilities: Vulnerability[]
  uuid: string
  clusterId: number
}

interface Node {
  type: string
  location: string
}

interface Service {
  service: string
  location: string
}

interface Vulnerability {
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

interface Options {
  enableCircularCheck: boolean
  enableImplicitConversion: boolean
  excludeExtraneousValues: boolean
  exposeDefaultValues: boolean
  exposeUnsetFields: boolean
  ignoreDecorators: boolean
}

interface RawObj {
  id: number
  cluster_id: number
  created_at: string
  uuid: string
  nodes: Nodes
  services: Services
  vulnerabilities: Vulnerabilities
}
