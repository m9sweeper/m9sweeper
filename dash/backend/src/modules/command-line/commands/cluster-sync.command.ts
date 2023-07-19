import {Injectable} from '@nestjs/common';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {KubernetesClusterService} from '../services/kubernetes-cluster.service';
import {KubernetesApiService} from '../services/kubernetes-api.service';
import {ClusterDao} from '../../cluster/dao/cluster.dao';
import {UserDao} from '../../user/dao/user.dao';
import {AppSettingsService} from '../../settings/services/app-settings.service';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {ClusterGroupService} from '../../cluster-group/services/cluster-group-service';
import {NamespaceComplianceService} from '../../namespace/services/namespace_compliance.service';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
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

    if (!clusters?.length) {
      this.log('No clusters matching the given ID found, skipping syncing', { clusterID }, 'syncCluster');
      return true;
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
}
