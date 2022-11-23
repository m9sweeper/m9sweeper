export enum AppSettingsType {
    SITE_SETTINGS = 'SITE_SETTINGS',
    LICENSE_SETTINGS = 'LICENSE_SETTINGS'
}

export type SettingsType = SiteSettingsType | LicenseSettingsType;

export enum SiteSettingsType {
    SITE_NAME = 'SITE_NAME',
    SITE_LOGO = 'SITE_LOGO'
}

export enum LicenseSettingsType {
    LICENSE_KEY ='LICENSE_KEY',
    INSTANCE_KEY = 'INSTANCE_KEY',
    IMAGE_SCANNING = 'IMAGE_SCANNING',
    IMAGE_SCANNING_ENFORCEMENT = 'IMAGE_SCANNING_ENFORCEMENT',
    IMAGE_SCANNING_EXCEPTIONS = 'IMAGE_SCANNING_EXCEPTIONS',
}