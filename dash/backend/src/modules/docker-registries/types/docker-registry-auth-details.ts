export type DockerRegistryAuthDetails = ACRAuthDetails | GCRAuthDetails | AzureCRAuthDetails;

export class AzureCRAuthDetails {
    azureClientId: string;
    azureClientSecret: string;
    azureTenantId: string;
}

export class ACRAuthDetails {
    acrAccessKey: string;
    acrSecretKey: string;
    acrDefaultRegion: string;
}

export class GCRAuthDetails {
    /** Raw text of the JSON file used for authentication in Google Container Registry */
    gcrAuthJson: string;
}
