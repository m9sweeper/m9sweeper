import {Injectable} from '@nestjs/common';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {KubernetesClusterService} from '../services/kubernetes-cluster.service';
import {KubernetesApiService} from '../services/kubernetes-api.service';
import {ClusterDao} from '../../cluster/dao/cluster.dao';
import {UserDao} from '../../user/dao/user.dao';
import {AppSettingsService} from '../../settings/services/app-settings.service';
import {LicensingPortalService} from '../../../integrations/licensing-portal/licensing-portal.service';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {ClusterGroupService} from '../../cluster-group/services/cluster-group-service';
import {NamespaceComplianceService} from '../../namespace/services/namespace_compliance.service';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {ClusterSummaryDto} from '../../../integrations/licensing-portal/licensing-portal.dto';
import {ClusterEventCreateDto} from '../../cluster-event/dto/cluster-event-create-dto';

@Injectable()
export class ClusterSyncCommand {
  debugMode = true;

  constructor(
    private readonly loggerService: MineLoggerService,
    private readonly kubernetesClusterService: KubernetesClusterService,
    private readonly kubernetesApiService: KubernetesApiService,
    private readonly clusterDao: ClusterDao,
    private readonly userDao: UserDao,
    private readonly settingsService: AppSettingsService,
    private readonly licensingPortalService: LicensingPortalService,
    private readonly appSettingsService:AppSettingsService,
    private readonly clusterEventService: ClusterEventService,
    private readonly clusterGroupService: ClusterGroupService,
    private readonly namespaceComplianceService: NamespaceComplianceService
  ) {}

  private log(label, data = {}, method = 'syncCluster'){
    if (this.debugMode) this.loggerService.log({label, ...data}, `ClusterSyncCommand.${method}`);
  }

  async syncCluster(clusterID: string): Promise<boolean> {
    this.log('Job started - Syncing cluster', {clusterID}, 'syncCluster');
    let clusterIDs: number[] | 'all' = 'all';
    if (clusterID !== 'all') clusterIDs = [parseInt(clusterID.toString(), 10)];
    const clusters: ClusterDto[] = await this._getClustersToSync(clusterIDs);
    const licenseValidityResult = await this._checkLicense(clusters);

    if (!clusters?.length) {
      this.log('No clusters matching the given ID found, skipping syncing', { clusterID }, 'syncCluster');
      return true;
    }

    // if there is no valid license (or an error occurred), exit
    // if (!licenseValidityResult.licenseIsValid) global.app.close();

    try {
      // run sync
      const clusterSummaries: ClusterSummaryDto[] = await this._getClusterSummaries(clusters);
      this.log('cluster summaries retrieved', {clusterSummaries}, 'syncCluster');
      const instanceSummary = await ClusterSyncCommand._compileInstanceSummary(clusterSummaries);

      // only upload summary stats to licensing portal IF they have a valid license and its enabled.
      // licensing is NOT required, therefore this should not be happening by default (some users
      // will run in an air-gapped environment and will NOT want us automatically uploading stats!)
      if (licenseValidityResult?.licenseIsValid) {
        await this.licensingPortalService
          .sendInstanceSummaryToLicensingPortal(licenseValidityResult.licenseAndInstanceKeys, {
            ...instanceSummary,
            clusterSummaries
          })
          .then((response) => {
            this.log(`Summaries sent to licensing portal. Was it successful? ${response.success}`, {response}, 'syncCluster');
          })
          .catch((e) => {
            this.log('Error when sending summaries to licensing portal', {error: {stack: e.stack, message: e.message}}, 'syncCluster');
          });
      }
    } catch (e) {
      this.log('Error syncing cluster(s)', {error: {stack: e.stack, message: e.message}}, 'syncCluster');
      const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
        'License Validation', 'Create', 'Error',
        `Scraping was canceled: An error occurred`, e.message);
      await this._saveClusterEventForAllClusters(clusters, clusterEventObject);
    }

    await this.namespaceComplianceService
      .calculateNamespaceComplianceForClusterPods(clusters)
      .then(() => {
        this.log('Successfully calculated namespace compliance for cluster pods', {}, 'syncCluster');
        return;
      })
      .catch((e) => {
        const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
          'Cluster Pod Compliance', 'Update', 'Error',
          `Cluster pods compliance check failed: An error occurred`, e.message);
        this._saveClusterEventForAllClusters(clusters, clusterEventObject);
        return e;
      });

    this.log('Job finished - Syncing cluster',  {}, 'syncCluster');
    return true;
  }

  private async _saveClusterEventForAllClusters(clusters: ClusterDto[], clusterEventObject: ClusterEventCreateDto) {
    const clusterIds = clusters?.map(cluster => cluster.id) || [];
    return await Promise.all(clusterIds.map(clusterId => this.clusterEventService.createClusterEvent(clusterEventObject, clusterId)));
  }

  private async _getClustersToSync(clusterIDs: number[] | 'all'): Promise<ClusterDto[]> {
    let clusters: ClusterDto[];

    // if clusterIDs is a string that says "all"
    if (typeof clusterIDs === 'string' && clusterIDs === 'all') {
      clusters = await this.clusterDao.getAllClusters();

    // if clusterIDs is an array of strings or numbers
    } else if (Array.isArray(clusterIDs) && clusterIDs.length && (typeof clusterIDs[0] === 'string' || typeof clusterIDs[0] === 'number')) {
      if (typeof clusterIDs[0] === 'string') {
        clusterIDs = clusterIDs.map(currentID => {return parseInt(currentID.toString(), 10)});
      }
      clusters = await this.clusterDao.getClustersById(clusterIDs);

    // otherwise the type of clusterIDs is invalid
    } else {
      throw new Error('Invalid cluster identification. clusterIDs must be either a list or the word "all." ');
    }
    return clusters;
  }

  private async _checkLicense(clusters: ClusterDto[]): Promise<{licenseAndInstanceKeys: {licenseKey: string, instanceKey: string}, licenseIsValid: boolean}> {
    let licenseAndInstanceKeys: {licenseKey: string, instanceKey: string};
    try {
      licenseAndInstanceKeys = await this.appSettingsService.getLicenseAndInstanceKeys();
      const licenseValidityInfo = await this.licensingPortalService.checkLicenseValidity(licenseAndInstanceKeys.licenseKey, licenseAndInstanceKeys.instanceKey);

      // if the licenseValidityInfo has the data key and isValid within it is true
      if (licenseValidityInfo.data && licenseValidityInfo.data.isValid) {
        this.log('License Key / Instance Key combination is VALID.', {}, '_checkLicense');
        return {licenseAndInstanceKeys, licenseIsValid: true};
      }

      // if the license data is missing or invalid - logging disabled since valid licenses are not required anywhere!
      this.log('License Key / Instance Key combination is invalid (but not required).', {}, '_checkLicense');
      /*const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
        'License Validation', 'Create', 'Error',
        `License Key / Instance Key combination is invalid. Please update in app_settings and try again to enable cluster scraping.`, 'License validity is ' + licenseValidityInfo);
      await this._saveClusterEventForAllClusters(clusters, clusterEventObject);*/
    } catch (e) {
      this.log('Error when starting cluster sync. ', {error: {stack: e.stack, message: e.message}}, '_checkLicense');
      const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
        'License Validation', 'Create', 'Error',
        `Scraping was canceled: Could not validate license key.`, e.message);
      await this._saveClusterEventForAllClusters(clusters, clusterEventObject);
    }

    // if it has gotten to this point, there was either an error or the license was invalid/missing
    return {licenseAndInstanceKeys, licenseIsValid: false};
  }

  private async _getClusterSummaries(clusters: ClusterDto[]): Promise<ClusterSummaryDto[]> {
    const clusterSummaries: ClusterSummaryDto[] = [];
    for (const cluster of clusters) {
      try {
        this.log('Syncing cluster', {clusterId: cluster?.id}, '_getClusterSummaries');
        const syncResults = await this.kubernetesClusterService.sync(cluster);
        this.log('Got the k8s node summary: ', {clusterId: cluster?.id, ...syncResults.nodeSummary}, '_getClusterSummaries');
        clusterSummaries.push({clusterId: cluster?.id, clusterName: cluster?.name, ...syncResults.nodeSummary});
        if (syncResults.everythingSuccessfullySynced) {
          await this.clusterDao.updateClusterLastScanned(cluster?.id);
        }
      } catch (e) {
        this.log('Error syncing cluster', {name: cluster?.name, id: cluster?.id, error: {stack: e.stack, message: e.message}}, '_getClusterSummaries');
      }
    }
    return clusterSummaries;
  }

  private static async _compileInstanceSummary(clusterSummaries: ClusterSummaryDto[]): Promise<{totalNodes: number, totalCPU: number, totalRAM: number}> {
    let totalNodes = 0;
    let totalCPU = 0;
    let totalRAM = 0;
    for (const summary of clusterSummaries) {
      totalNodes += summary.numNodes ? summary.numNodes : 0;
      totalCPU += summary.numCPU ? summary.numCPU : 0;
      totalRAM += summary.amountRAM ? summary.amountRAM : 0;
    }
    return {totalNodes, totalCPU, totalRAM}
  }
}
