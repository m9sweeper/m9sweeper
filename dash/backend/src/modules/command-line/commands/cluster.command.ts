import {Injectable} from '@nestjs/common';
import {Command, Positional} from 'nestjs-command';
import {MineLoggerService} from '../../shared/services/mine-logger.service';
import {KubernetesClusterService} from '../services/kubernetes-cluster.service';
import {ClusterDao} from '../../cluster/dao/cluster.dao';
import {ClusterDto} from '../../cluster/dto/cluster-dto';
import {KubernetesApiService} from '../services/kubernetes-api.service';
import {CoreV1Api} from '@kubernetes/client-node/dist/gen/api/coreV1Api';
import {KubeConfig} from '@kubernetes/client-node/dist/config';
import * as Url from 'url';
import {UserDao} from '../../user/dao/user.dao';
import {PolicyDto} from '../../policy/dto/policy-dto';
import {ScannerDto} from '../../scanner/dto/scanner-dto';
import {AppSettingsService} from '../../settings/services/app-settings.service';
import {AppSettingsType, LicenseSettingsType} from '../../settings/enums/settings-enums';
import {LicensingPortalService} from '../../../integrations/licensing-portal/licensing-portal.service';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {ClusterSummaryDto, InstanceSummaryDto} from '../../../integrations/licensing-portal/licensing-portal.dto';
import {ClusterGroupService} from '../../cluster-group/services/cluster-group-service';
import { NamespaceComplianceService } from '../../namespace/services/namespace_compliance.service';
import { AppSettingsDto } from "../../settings/dto/app-settings-dto";


/**
 * These commands are used to scrape what is currently running on all associated Kubernetes clusters.
 */
@Injectable()
export class ClusterCommand {

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

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    /*@Command({ command: 'cluster:sync:old <clusterId>', describe: 'Syncs cluster data' })
    async get(
        @Positional({
            name: 'clusterId',
            // describe: 'Database ID of a cluster',
            // type: 'string',
        }) clusterId: string,
    ) {
        this.loggerService.log({label: 'Job started - Syncing cluster', data: {clusterId}}, ClusterCommand.name);
        const clusters: ClusterDto[] = await this.clusterDao.getAllClusters();
        try {
            let licenseOk = true;
            const keys = await this.appSettingsService.getLicenseAndInstanceKeys();
            const licenseValidityInfo = await this.licensingPortalService.checkLicenseValidity(keys.licenseKey, keys.instanceKey);
            if (!licenseValidityInfo.data?.isValid) {
                const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
                    'License Validation', 'Create', 'Error',
                    `License Key / Instance Key combination is invalid. Please update in app_settings and try again to enable cluster scraping.`, 'License validity is ' + licenseValidityInfo);
                if (clusterId !== 'all') {
                    await this.clusterEventService.createClusterEvent(clusterEventObject, Number(clusterId));
                } else {
                    const clusterIds = clusters.map(cluster => cluster.id);
                    await Promise.all(clusterIds.map(clusterId => this.clusterEventService.createClusterEvent(clusterEventObject, clusterId)));
                }
                console.log('License Key / Instance Key combination is invalid. Please update in app_settings and try again to enable cluster scraping. ');
                licenseOk = false;
            } else {
                console.log('License Key / Instance Key combination is VALID.');
            }

            if (licenseOk === true ) {
                const clusterSummaries: ClusterSummaryDto[] = [];
                if (clusterId === 'all') {
                    while (clusters?.length) {
                        const cluster = clusters.pop();
                        try {
                            this.loggerService.log({label: 'Syncing cluster', data: {clusterId: cluster?.id}}, ClusterCommand.name);
                            const syncResults = await this.kubernetesClusterService.sync(cluster);
                            const nodesSummary = syncResults.nodeSummary;
                            console.log('Got the k8s node summary', {clusterId: cluster?.id, ...nodesSummary});
                            clusterSummaries.push({clusterId: cluster?.id, clusterName: cluster?.name, ...nodesSummary});
                            if (syncResults.everythingSuccessfullySynced) {
                              await this.clusterDao.updateClusterLastScanned(cluster?.id);
                            }
                        } catch (e) {
                            console.log('Error syncing cluster', {name: cluster?.name, id: cluster?.id, error: e});
                        }
                    }
                } else {
                    const cluster: ClusterDto = await this.clusterDao.getClusterById(+clusterId);
                    const syncResults = await this.kubernetesClusterService.sync(cluster);
                    const nodesSummary = syncResults.nodeSummary;
                    clusterSummaries.push({clusterId: cluster?.id, clusterName: cluster?.name, ...nodesSummary});
                    if (syncResults.everythingSuccessfullySynced) {
                      await this.clusterDao.updateClusterLastScanned(cluster?.id);
                    }
                }
                console.log(clusterSummaries);
                try {
                    let totalNodes = 0;
                    let totalCPU = 0;
                    let totalRAM = 0;
                    for (const summary of clusterSummaries) {
                        totalNodes += summary.numNodes ? summary.numNodes : 0;
                        totalCPU += summary.numCPU ? summary.numCPU : 0;
                        totalRAM += summary.amountRAM ? summary.amountRAM : 0;
                    }
                    const summaryToSend: InstanceSummaryDto = {totalNodes, totalCPU, totalRAM, clusterSummaries};
                    console.log(summaryToSend, keys.instanceKey);
                    const lpResponse = await this.licensingPortalService.sendInstanceSummaryToLicensingPortal(keys, summaryToSend);
                    console.log('Summaries sent to licensing portal. Successful?', lpResponse.success);
                } catch (e) {
                    console.log('Error when building the summary or sending it to the licensing portal', e);
                }
            }
        } catch (err) {
            console.log('Error when starting cluster sync. ', err);
            const clusterEventObject = this.clusterEventService.createClusterEventObject(0,
                'License Validation', 'Create', 'Error',
                `Scraping was canceled: Could not validate license key.`, err.message);
            if (clusterId !== 'all') {
                await this.clusterEventService.createClusterEvent(clusterEventObject, Number(clusterId));
            } else {
                const clusterIds = clusters.map(cluster => cluster.id);
                await Promise.all(clusterIds.map(clusterId => this.clusterEventService.createClusterEvent(clusterEventObject, clusterId)));
            }
        }

        this.loggerService.log({label: 'Started calculating namespace compliance for cluster', data: {clusterId}}, ClusterCommand.name);

        await this.namespaceComplianceService.calculateNamespaceComplianceForClusterPods();

        this.loggerService.log({label: 'Finished calculating namespace compliance for cluster', data: {clusterId}}, ClusterCommand.name);

        this.loggerService.log({label: 'Job finished - Syncing cluster', data: {clusterId}}, ClusterCommand.name);
    }*/

    // @TODO: Remove all log messages so this will be silent
    @Command({ command: 'cluster:seed', describe: 'Seeds the DB with the current cluster' })
    async seedCluster(): Promise<void> {
        const clusterName = process.env.FIRST_CLUSTER_NAME;
        const clusterGroupName = process.env.FIRST_CLUSTER_GROUP_NAME;
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        const licenseKey = process.env.LICENSE_KEY || "";
        const instanceKey = process.env.INSTANCE_KEY || "";

        // validate required fields are present
        if (!(superAdminEmail && clusterGroupName && clusterName)) {
            this.loggerService.log({label: 'Skipping seeding cluster - missing SUPER_ADMIN_EMAIL, FIRST_CLUSTER_GROUP_NAME, or FIRST_CLUSTER_NAME.'});
            return;
        }

        // save license & instance key if neither already exist in the DB
        try {
            const settings: AppSettingsDto[] = await this.settingsService.getLicenseSettings();
            if (!settings.some(s => s.name === LicenseSettingsType.LICENSE_KEY) && !settings.some(s => s.name === LicenseSettingsType.INSTANCE_KEY)) {
                await this.settingsService.saveSettings(
                  AppSettingsType.LICENSE_SETTINGS, [
                      {
                          name: LicenseSettingsType.LICENSE_KEY,
                          value: licenseKey
                      },
                      {
                          name: LicenseSettingsType.INSTANCE_KEY,
                          value: instanceKey
                      }
                  ], 0
                );
            } else {
                this.loggerService.log({label: 'License settings already exist - skipping creation.'});
            }
        } catch (e) {
            console.log('Error saving license & instance key', e);
            return;
        }

        // Do not attempt to create the cluster or cluster group if the cluster group already exists
        const existingGroups = await this.clusterGroupService.countClusterGroups();
        if (existingGroups > 0) {
            console.log(`Cluster groups already exist. Skipping Cluster & Cluster group creation`);
            return;
        }

        // Try to get the user's ID
        let userId: number;
        try {
            const user = await this.userDao.loadUser({email: superAdminEmail});
            userId = !!user ? user[0].id : null;
            if (!userId) {
                this.loggerService.log({label: 'Specified admin user does not exist - unable to initialize cluster'});
                return;
            }
        } catch (e) {
            console.log('Failed to retrieve user', e);
            return;
        }

        // @TODO: If any cluster/cluster groups exist in the DB, skip the rest of the function. This should ONLY be run on the initial install and not 
        // any subsequent re-installs

        // Try connecting to default IP address if no server is provided or connecting to that server failed
        let config: KubeConfig;
        let k8sApi: CoreV1Api;
        try {
            console.log('Connecting to default server');
            config = this.kubernetesApiService.loadConfigFromCluster();
            console.log('Config', config);
            k8sApi = await this.kubernetesApiService.makeValidApi(config);
            if (!k8sApi) {
                console.log('Couldn\'t connect to default server');
                config = null;
            }
        } catch(e) {
            console.log('Error connecting to default server', e)
            config = k8sApi = null;
        }

        // Save to database if connection was successful
        if (config) {
            try {
                console.log('Prepping to save to to DB');
                // Get context & cluster data
                const currentContextName = config.getCurrentContext();
                const currentCluster = config.getCurrentCluster();

                config = this.kubernetesApiService.clearOtherContexts(config);
                await this.kubernetesApiService.switchCurrentUserAuthToToken(config, this.kubernetesApiService.getToken());

                // Separate the IP & port
                const parsedUrl = Url.parse(currentCluster.server);
                const ip = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
                const port = parsedUrl.port;

                // Encode config in base64 as JSON
                console.log('Encoding Config as base64 JSON');
                const configJson = config.exportConfig();
                const configBuffer = Buffer.from(configJson, "utf8");
                const encodedConfig = configBuffer.toString("base64");
                console.log('Encoded config')

                const cluster = {
                    name: clusterName,
                    port: port,
                    api_key: "",
                    ip_address: ip,
                    context: currentContextName,
                    kube_config: encodedConfig
                };

                const policy = new PolicyDto();
                policy.name = 'No High or Critical with fixes';
                policy.description = "No high or critical CVE's with vendor fixes available";
                policy.newScanGracePeriod = 30;
                policy.rescanGracePeriod = 7;
                policy.enabled = true;
                policy.enforcement = true;

                const scanner = new ScannerDto();
                scanner.name = 'Trivy';
                scanner.description = 'Trivy Scanner';
                scanner.type = 'TRIVY';
                scanner.required = true;
                scanner.enabled = true;
                scanner.vulnerabilitySettings = {
                    fixableCritical : 0,
                    fixableMajor : 0,
                    fixableNormal : 1000,
                    fixableLow : 1000,
                    fixableNegligible : 1000,
                    unFixableCritical : 1000,
                    unFixableMajor : 1000,
                    unFixableNormal : 1000,
                    unFixableLow : 1000,
                    unFixableNegligible : 1000
                };

                console.log('About to send to DB to be saved', cluster);
                await this.clusterDao.seedInitialCluster(cluster, clusterGroupName, policy, scanner, userId);
            } catch (e) {
                console.log("Error saving to DB", e);
            }
        } else {
            this.loggerService.log({label: 'Skipping saving default cluster - could not connect. '});
        }
    }
}
