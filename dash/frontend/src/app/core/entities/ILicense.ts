export interface ILicense {
  isValid?: boolean;
  licenseExpirationDate?: string;
  quotas?: any[];
  features: IFeature[];
}

export interface IFeature {
  id?: number;
  name?: string;
}
