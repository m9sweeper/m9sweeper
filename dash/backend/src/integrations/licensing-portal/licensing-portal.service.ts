import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import {InstanceSummaryDto, LicenseAndInstanceValidityDto, LicenseSettingDto} from "./licensing-portal.dto";
import {ConfigService} from "@nestjs/config";
import {catchError, map} from "rxjs/operators";
import {ClusterService} from "../../modules/cluster/services/cluster.service";
import {of} from "rxjs";
import {AppSettingsService} from "../../modules/settings/services/app-settings.service";
import {LicenseSettingsType} from "../../modules/settings/enums/settings-enums";
import {LicenseFeatures} from "../../modules/cluster-validation/enums/LicenseFeatures";

@Injectable()
export class LicensingPortalService {
  private readonly licensingPortalBaseUrl: string;
  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService,
    private clusterService: ClusterService,
    private readonly  appSettingsService: AppSettingsService
  ) {
    // Intentionally hard-coded as security. It is more difficult for people to find & modify this URL if it is a hard-coded, encoded constant
    // For testing against a local licensing portal instance or the dev environment, uncomment the relevant line from below.
    const licensingPortalBaseUrlRaw = 'aHR0cHM6Ly9saWNlbnNpbmcubTlzd2VlcGVyLmlv';
    this.licensingPortalBaseUrl = Buffer.from(licensingPortalBaseUrlRaw, 'base64').toString();
    // this.licensingPortalBaseUrl = 'http://0.0.0.0:3200';  // local url
    // this.licensingPortalBaseUrl = 'https://dev-licensing.m9sweeper.io'; //dev environment URL
  }

  async checkLicenseValidity(licenseKey = '', instanceKey = ''): Promise<LicenseAndInstanceValidityDto> {
    const licensingPortalCheckValidityUrl = this.licensingPortalBaseUrl + '/api/instances/validity?'; // + `licenseKey=${licenseKey}` + `instanceKey=${instanceKey}`;
    return this.httpService
      .get(licensingPortalCheckValidityUrl, {params: {licenseKey, instanceKey}})
      .pipe( // @ts-ignore
          map(response => response.data),
          catchError(err => {
            return of(err.response.data);
          })
      )
      .toPromise();
  }

  async checkLicenseValidityFromDash(): Promise<{ validity: boolean; message: string; isLicenseSetup: boolean }> {
    let validity = false;
    let message = '';
    let isLicenseSetup = false;

    const licenceSettings = await this.appSettingsService.getLicenseSettingsFromDash();

    if (licenceSettings && licenceSettings.length) {
      const licenseKey = licenceSettings.filter(setting => setting.name === LicenseFeatures.LICENSE_KEY);
      if (!licenseKey.length) {
        message = 'Could not find the License Key';
        return {validity, message, isLicenseSetup};
      }

      const instanceKey = licenceSettings.filter(setting => setting.name === LicenseFeatures.INSTANCE_KEY);
      if (!instanceKey.length) {
        message = 'Could not find the Instance Key';
        return {validity, message, isLicenseSetup};
      }

      let expirationDate: LicenseSettingDto | LicenseSettingDto[] = licenceSettings.filter(setting => setting.name === LicenseFeatures.EXPIRATION_DATE);
      if (!expirationDate.length) {
        isLicenseSetup = true;
        message = 'Could not find license expiration date';
        return {validity, message, isLicenseSetup};
      } else {
        isLicenseSetup = true;
        expirationDate = expirationDate[0];
        if (Number(expirationDate.value) > Date.now()) {
          validity = true;
          message = `License is valid until ${new Date(Number(expirationDate.value)).toISOString()}`;
          return {validity, message, isLicenseSetup};
        } else {
          message = 'License has been expired';
          return {validity, message, isLicenseSetup};
        }
      }
    }

    return {validity, message, isLicenseSetup};
  }

  async sendInstanceSummaryToLicensingPortal(keys: {instanceKey: string, licenseKey: string}, instanceSummary: InstanceSummaryDto): Promise<any> {
    const instanceSummaryUrl = `${this.licensingPortalBaseUrl}/api/instances/current-summary`
    return this.httpService
      .post(instanceSummaryUrl, {keys, instanceSummary}) // @ts-ignore
      .pipe(map(response => response.data))
      .toPromise();
  }

}
