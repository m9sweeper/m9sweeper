import {ClusterDto} from "../../modules/cluster/dto/cluster-dto";
import {Exclude, Expose} from "class-transformer";

export class LicensingPortalDto {}

export enum QuotaTypes {
  MAX_NODES,
  MAX_CPU,
  MAX_RAM,
}

export class QuotaDto {
  quota_type_name: QuotaTypes;
  value: number;
}
export class FeatureDto {
  id: number;
  name: string;
}

export class LicenseAndInstanceValidityDto {
  success: boolean;
  message: string;
  data: {
    isValid: boolean;
    licenseExpirationDate: Date | number;
    quotas: QuotaDto[];
    features: FeatureDto[];
  };
}

export class ClusterSummaryDto {
  clusterId: number;
  clusterName: string;
  numNodes: number;
  numCPU: number;
  amountRAM: number;
}

export class InstanceSummaryDto {
  totalNodes: number;
  totalCPU: number;
  totalRAM: number;
  clusterSummaries: ClusterSummaryDto[]
}

@Exclude()
export class LicenseSettingDto {
  @Expose()
  name: string;
  @Expose()
  value: string;
}

// features
// max cpu cores
// max ram
// max nodes
// app settings table

// metrics upload to cloud: current state & history
// build out data model for that as well ^^
