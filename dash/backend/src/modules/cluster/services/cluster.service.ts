import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {ClusterDto} from '../dto/cluster-dto';
import {ClusterDao} from '../dao/cluster.dao';
import {ClusterEventService} from '../../cluster-event/services/cluster-event.service';
import {instanceToPlain, plainToInstance} from "class-transformer";
import {KubeConfig} from "@kubernetes/client-node/dist/config";
import {
  AdmissionregistrationV1Api,
  AdmissionregistrationV1WebhookClientConfig,
  CustomObjectsApi,
  PatchUtils,
  V1ObjectMeta,
  V1RuleWithOperations
} from "@kubernetes/client-node";
import {KubernetesApiService} from "../../command-line/services/kubernetes-api.service";
import {V1ValidatingWebhookConfiguration} from "@kubernetes/client-node/dist/gen/model/v1ValidatingWebhookConfiguration";
import {V1ValidatingWebhook} from "@kubernetes/client-node/dist/gen/model/v1ValidatingWebhook";
import {ConfigService} from "@nestjs/config";
import * as jsYaml from 'js-yaml';
import * as fs from "fs";
import {GatekeeperTemplateDto} from "../dto/gatekeeper-template-dto";
import {
  GatekeeperConstraintDetailsDto,
  GatekeeperConstraintMetadata,
  GatekeeperConstraintMetadataAnnotations,
  GatekeeperConstraintSpec,
  GatekeeperConstraintSpecMatch,
  GatekeeperConstraintSpecMatchKind,
  GateKeeperConstraintViolation
} from "../dto/gatekeeper-constraint-dto";
import {CoreV1Api} from "@kubernetes/client-node/dist/gen/api/coreV1Api";
import {ApiregistrationV1Api} from "@kubernetes/client-node/dist/gen/api/apiregistrationV1Api";
import {KubernetesClusterService} from "../../command-line/services/kubernetes-cluster.service";
import {ExceptionBlockService} from "../../command-line/services/exception-block.service";
import { PrometheusV1Service } from '../../metrics/services/prometheus-v1.service';
import {AuditLogService} from "../../audit-log/services/audit-log.service";
import { MineLoggerService } from '../../shared/services/mine-logger.service';

@Injectable()
export class ClusterService {
  private readonly entityType: string = 'Cluster';
  constructor(
      private readonly clusterDao: ClusterDao,
      private readonly clusterEventService: ClusterEventService,
      private readonly kubernetesApiService: KubernetesApiService,
      private readonly kubernetesClusterService: KubernetesClusterService,
      private readonly exceptionBlockService: ExceptionBlockService,
      private readonly configService: ConfigService,
      private readonly prometheusService: PrometheusV1Service,
      private readonly auditLogService: AuditLogService,
      private logger: MineLoggerService,
  ) {}

  async createCluster(cluster: ClusterDto, installWebhook: boolean, serviceAccountConfig?: string): Promise<ClusterDto> {
    const checkClusterName = await this.clusterDao.getClusterByClusterName({'c.deleted_at': null, 'c.name': cluster.name});
    if(checkClusterName && checkClusterName.length > 0){
      throw new HttpException({status: HttpStatus.NOT_FOUND, message: 'Cluster already exists.'}, HttpStatus.NOT_FOUND)
    }

    cluster.kubeConfig = serviceAccountConfig
      || await this.kubernetesApiService.AddServiceAccount(cluster.kubeConfig)
        .catch(() => { throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Could not connect to cluster using provided kube config', entityType: this.entityType}, HttpStatus.BAD_REQUEST);});
    if (!cluster.kubeConfig) {
      throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Could not create service account with provided kubeconfig', entityType: this.entityType}, HttpStatus.BAD_REQUEST);
    }
    const clusterObj = Object.assign(new ClusterDto(), cluster);
    const clusterId = await this.clusterDao.createCluster(instanceToPlain(clusterObj));
    if (clusterId){
      this.prometheusService.clusterCreated.inc();
      await this.exceptionBlockService.copyGatekeeperTemplatesForCluster(clusterId);
      delete cluster.kubeConfig;
      const clusterEventData = this.clusterEventService.createClusterEventObject(0,'Cluster', 'Create', 'info',  `${cluster.name} is created`, cluster);
      await this.clusterEventService.createClusterEvent(clusterEventData, clusterId);

      const namespace = 'default';
      const message = `A new Cluster: ${cluster.name} has been created`;
      await this.clusterEventService.createK8sClusterEvent('ClusterCreated', 'Normal',
          null, null, message, clusterId, namespace);
      if (installWebhook) {
        const checkForExistingWebhook = await this.checkIfWebhookExists(`m9sweeper-validation-hook-cluster-${clusterId}`, clusterId);
        if (!checkForExistingWebhook) {
          await this.createWebhookForCluster(clusterId);
        }
      }
      return this.clusterDao.getClusterById(clusterId);
    }
  }

  async searchClustersByName(clusterName: string): Promise<ClusterDto[]> {
    return await this.clusterDao.getClusterByClusterName({'c.deleted_at': null, 'c.name': clusterName});
  }

  async getClusterById(id: number): Promise<ClusterDto> {
    return await this.clusterDao.getClusterById(id);
  }

  async updateCluster(cluster: ClusterDto, id: number, installWebhook: boolean | null, serviceAccountConfig?: string | null, rerunWizard = false): Promise<ClusterDto> {
    // delete cluster.kubeConfig;

    const changedData = [];
    const checkClusterName = await this.clusterDao.getClusterByClusterName({'c.deleted_at': null, 'c.name': cluster.name}, id);
    if(checkClusterName && checkClusterName.length > 0){
      throw new HttpException({status: HttpStatus.CONFLICT, message: 'Cluster Name already exists.', entityType: this.entityType, entityId: id}, HttpStatus.CONFLICT)
    }
    const currentCluster = await this.clusterDao.getClusterById(id);
    if(currentCluster.context) {
      if (cluster.context !== currentCluster.context) {
        changedData.push('the context was changed');
      }
    }
    if(currentCluster.tags && !rerunWizard) {
     const clusterTags = typeof cluster.tags === 'string' ? JSON.parse(cluster.tags as any) : cluster.tags;
      if (clusterTags.length > currentCluster.tags.length) {
        changedData.push(`added ${clusterTags.length - currentCluster.tags.length} tags`);
      } else if (clusterTags.length < currentCluster.tags.length) {
        changedData.push(`deleted ${currentCluster.tags.length - clusterTags.length} tags`);
      }
    }
    if(cluster.name !== currentCluster.name) {
      changedData.push(`cluster's name was changed from ${currentCluster.name} to ${cluster.name}`);
    }
    if (cluster.gracePeriodDays !== currentCluster.gracePeriodDays) {
      changedData.push(`the number of days in the grace period was changed from ${currentCluster.gracePeriodDays} to ${cluster.gracePeriodDays}`);
    }
    if(cluster.groupId !== currentCluster.groupId) {
      changedData.push('the group id changed');
    }
    if(cluster.ipAddress !== currentCluster.ipAddress) {
      changedData.push('the ip address changed');
    }
    if(currentCluster.port) {
      if (cluster.port !== currentCluster.port) {
        changedData.push('the port changed');
      }
    }
    let changedDataAsString = changedData.join(', ');
    changedDataAsString = changedDataAsString.charAt(0).toUpperCase() + changedDataAsString.substring(1);

    const clusterObj = Object.assign(new ClusterDto(), cluster)

    if (serviceAccountConfig === 'automatically') {
      clusterObj.kubeConfig = await this.kubernetesApiService.AddServiceAccount(cluster.kubeConfig)
        .catch(() => {
          throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Could not connect to cluster with provided kubeconfig', entityType: this.entityType, entityId: id}, HttpStatus.BAD_REQUEST);
        })
      if (cluster.kubeConfig === null) {
        throw new HttpException({status: HttpStatus.BAD_REQUEST, message: 'Could not create service account with kubeconfig', entityType: this.entityType, entityId: id}, HttpStatus.BAD_REQUEST);
      }
    } else if (!!serviceAccountConfig) {
      clusterObj.kubeConfig = serviceAccountConfig;
    } else {
      // Don't change the kube config if it shouldn't be changed
      clusterObj.kubeConfig = cluster.kubeConfig;
    }

    const updatedCluster = await this.clusterDao.updateCluster(clusterObj, id);
    const clusterEventData = this.clusterEventService.createClusterEventObject(0,'Cluster', 'Update', 'info',  `${cluster.name} is updated`, changedDataAsString);
    await this.clusterEventService.createClusterEvent(clusterEventData, id);

    if (installWebhook) {
      // I'm not convinced that this is working as expected.
      // checkIfWebhookExists should return boolean T/F indicating whether it exists
      // if it doesn't exist, it should create it
      // instead, it's creating it if it gets an error
      try {
        await this.checkIfWebhookExists(`m9sweeper-validation-hook-cluster-${id}`, id);
      }
      catch(error) {
        try {
          await this.createWebhookForCluster(id);
        } catch (e) {
          this.logger.error({label: 'Error creating webhook for cluster', data: { clusterId: id }}, e, 'ClusterService.updateCluster');
        }
      }
    }
    await this.kubernetesClusterService.sync(updatedCluster);
    updatedCluster.kubeConfig = null;
    return updatedCluster;
  }

  async getAllClusters(): Promise<ClusterDto[]> {
    return this.clusterDao.getAllClusters();
  }

  async getClustersByGroupId(id: number): Promise<ClusterDto[]> {
    return this.clusterDao.getClustersByGroupId(id);
  }

  async searchClusters(groupId: number, searchTerm: string): Promise<ClusterDto[]> {
    return this.clusterDao.searchClusters(groupId, searchTerm);
  }

  async deleteClusterById(id: number): Promise<ClusterDto>{
    await this.deleteClusterWebhook(id);
    await this.exceptionBlockService.deleteGatekeeperTemplatesForCluster(id);
    const results = await this.clusterDao.deleteClusterById(id);
    if (results && Array.isArray(results) && results.length > 0) {
      return results[0];
    }
    return null;
  }

  async saveK8sClustersHistory(dayStr: string): Promise<any> {
    // Get yesterday's date as a string formatted yyyy-mm-dd
    //const dayStr: string = yesterdaysDateAsStr();

    // Clear any existing history entries for this date
    try {
      this.logger.log({label: 'Clearing cluster history for date', data: { date: dayStr }}, 'ClusterService.saveK8sClustersHistory');
      await this.clusterDao.clearK8sClustersHistory(dayStr);
    } catch (e) {
      this.logger.error({label: 'Error clearing K8s history for date', data: { date: dayStr }}, e, 'ClusterService.saveK8sClustersHistory');
    }

    // Get all the currently active clusters
    const currentClusters = await this.clusterDao.getAllClusters();

    // Save a history entry for each of the current clusters.
    if (currentClusters) {
      for (const cluster of currentClusters) {
        try {
          this.logger.log({label: 'Saving cluster history', data: { cluster: cluster.name }}, 'ClusterService.saveK8sClustersHistory');
          await this.clusterDao.saveK8sClustersHistory(cluster, dayStr);
          //const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Cluster History', 'History', 'Info', `History of ${cluster.name}`, null);
          //await this.clusterEventService.createClusterEvent(clusterEventData, cluster.id);
        } catch (e) {
          delete cluster.kubeConfig;
          const clusterEventData = this.clusterEventService.createClusterEventObject(0, 'Cluster History', 'History', 'Error', `Error with ${cluster.name} history: ${e.message}.`, cluster);
          await this.clusterEventService.createClusterEvent(clusterEventData, cluster.id);
        }
      }
    }
  }

  async createWebhookForCluster(clusterId: number): Promise<void> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const admissionregistrationV1Api = kubeConfig.makeApiClient(AdmissionregistrationV1Api);

    const v1ValidatingWebhookConfiguration: V1ValidatingWebhookConfiguration = new V1ValidatingWebhookConfiguration();
    v1ValidatingWebhookConfiguration.apiVersion = 'admissionregistration.k8s.io/v1';
    v1ValidatingWebhookConfiguration.kind = 'ValidatingWebhookConfiguration';
    v1ValidatingWebhookConfiguration.metadata = new V1ObjectMeta();
    v1ValidatingWebhookConfiguration.metadata.name = `m9sweeper-validation-hook-cluster-${clusterId}`;

    const v1ValidatingWebhook: V1ValidatingWebhook = new V1ValidatingWebhook();
    v1ValidatingWebhook.name = 'm9sweeper-validation-hook.m9sweeper.io';

    const v1ValidatingWebhookClientConfig: AdmissionregistrationV1WebhookClientConfig = new AdmissionregistrationV1WebhookClientConfig();
    v1ValidatingWebhookClientConfig.url = `${this.configService.get('server.baseUrl')}/api/clusters/${clusterId}/validation`;
    v1ValidatingWebhook.clientConfig = v1ValidatingWebhookClientConfig;
    v1ValidatingWebhook.admissionReviewVersions = ["v1", "v1beta1"];
    v1ValidatingWebhook.failurePolicy = 'Ignore';
    v1ValidatingWebhook.sideEffects = 'None';
    v1ValidatingWebhook.timeoutSeconds = 10;

    const v1RuleWithOperations = new V1RuleWithOperations();
    v1RuleWithOperations.apiGroups = [""];
    v1RuleWithOperations.apiVersions = ['v1', 'v1beta1'];
    v1RuleWithOperations.operations = ['CREATE'];
    v1RuleWithOperations.resources = ["pods/*"];
    v1RuleWithOperations.scope = "*";

    v1ValidatingWebhook.rules = [v1RuleWithOperations];

    v1ValidatingWebhookConfiguration.webhooks = [v1ValidatingWebhook];

    try {
      const create_webhook = await admissionregistrationV1Api.createValidatingWebhookConfiguration(v1ValidatingWebhookConfiguration);
      if (create_webhook.body.webhooks.length) {
        this.logger.log({label: 'Webhook has been created', data: { name: `m9sweeper-validation-hook-cluster-${clusterId}` }}, 'ClusterService.createWebhookForCluster');
      }
    }
    catch (e) {
      this.logger.error({label: 'Error creating webhook', data: { clusterId }}, e, 'ClusterService.createWebhookForCluster');
    }
  }

  async deleteClusterWebhook(clusterId: number): Promise<void> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const admissionregistrationV1Api = kubeConfig.makeApiClient(AdmissionregistrationV1Api);
    const webhook = `m9sweeper-validation-hook-cluster-${clusterId}`;
    try {
      const response = await admissionregistrationV1Api.deleteValidatingWebhookConfiguration(webhook);
    } catch(e) {
      this.logger.error({label: 'Error deleting webhook', data: { clusterId, webhook }}, e, 'ClusterService.deleteClusterWebhook');
    }
  }

  async checkIfWebhookExists(webhookName: string, clusterId: number): Promise<boolean>{
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const admissionregistrationV1Api = kubeConfig.makeApiClient(AdmissionregistrationV1Api);
    try {
      const checkWebhooks = await admissionregistrationV1Api.readValidatingWebhookConfiguration(webhookName);
      const webhooks = checkWebhooks.body.webhooks;
      return !!(webhooks && webhooks.length);
    } catch (e) {
      this.logger.error({label: 'Webhook does not exist', data: { clusterId, webhookName }}, e, 'ClusterService.checkIfWebhookExists');
      return false;
    }

  }

  async getKubeConfig(clusterId: number): Promise<KubeConfig> {
    const kubeConfig: KubeConfig = new KubeConfig();
    const cluster: ClusterDto = await this.clusterDao.getClusterById(+clusterId);
    const kubeConfigString = Buffer.from(cluster.kubeConfig, 'base64').toString();
    kubeConfig.loadFromString(kubeConfigString);
    kubeConfig.setCurrentContext(cluster.context);
    return kubeConfig;
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //                                                   Gatekeeper
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async readFolderNames(pathName: string): Promise<string[]> {
    try {
      const readDirNamesFromFile = jsYaml.load(fs.readFileSync(pathName, 'utf-8')) as any;
      return readDirNamesFromFile.resources;
    } catch (e) {
      this.logger.error({label: 'Could not read file at path', data: { pathName }}, e, 'ClusterService.readFolderNames');
      return [];
    }
  }

  async getDirectoryStructure(): Promise<{ [dirName: string]: string[] }> {
    const templateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    const dirStructure = {};
    const topDirs = await this.readFolderNames(`${templateDir}/kustomization.yaml`);
    if (topDirs && topDirs.length) {
      for(const dir of topDirs) {
        const fileName = `${templateDir}/${dir}/kustomization.yaml`;
        dirStructure[dir] = await this.readFolderNames(fileName);
      }
    }
    return dirStructure;
  }

  async checkGatekeeperInstallationStatus(clusterId: number): Promise<{status: boolean, message: string, error: any}> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const apiRegistration = kubeConfig.makeApiClient(ApiregistrationV1Api);
    let installationStatus = false;
    try {
      const resource = await apiRegistration.readAPIService('v1beta1.templates.gatekeeper.sh');
      this.logger.log({label: 'GateKeeper installation status', data: { clusterId, status: resource.body.status }}, 'ClusterService.checkGatekeeperInstallationStatus');
      installationStatus = !!resource.body.status.conditions.length;
      if (installationStatus) {
        const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
        const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '')
        const templates: any[] = templateListResponse.body['items'];
        if (templates.length) {
          return {status: installationStatus, message: 'Setup', error: null};
        } else {
          return {status: installationStatus, message: 'Not Setup', error: null};
        }
      } else {
        return {status: installationStatus, message: 'Not Installed', error: null};
      }
    }
    catch(e) {
      this.logger.error({label: 'Error checking GateKeeper installation status', data: { clusterId }}, e, 'ClusterService.checkGatekeeperInstallationStatus');
      return {status: installationStatus, message: 'Not Installed', error: e.message};
    }
  }

  async getOPAGateKeeperConstraintTemplates(clusterId: number): Promise<GatekeeperTemplateDto[]> {
    await this.exceptionBlockService.copyGatekeeperTemplatesForCluster(clusterId);
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '')
      const templates: any[] = templateListResponse.body['items'];
      const templatesDto: GatekeeperTemplateDto[] = plainToInstance(GatekeeperTemplateDto, templates);
      for(const template of templatesDto) {
        const constraintCount = await this.gateKeeperTemplateConstraintsCount(clusterId, template.metadata.name);
        template.constraintsCount = constraintCount;
        template.enforced = constraintCount ? true : false;
      }
      return templatesDto;
    }
    catch(e) {
      this.logger.error({label: 'Error getting GateKeeper constraint templates', data: { clusterId }}, e, 'ClusterService.getOPAGateKeeperConstraintTemplates');
    }
  }

  async deployOPAGateKeeperConstraintTemplates(clusterId: number, templateName: string): Promise<{message: string, statusCode: number}> {
    this.logger.log({label: 'Going to deploy GateKeeper constraint template', data: { clusterId, templateName }}, 'ClusterService.deployOPAGateKeeperConstraintTemplates');
    const templateDir = `${this.configService.get('gatekeeper.gatekeeperTemplateDir')}/../cluster-${clusterId}-gatekeeper-templates`;
    try {
      const readGatekeeperTemplate = jsYaml.load(fs.readFileSync(`${templateDir}/${templateName}/template.yaml`, 'utf-8')) as any;
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      await customObjectApi.createClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', readGatekeeperTemplate);
      return {message: 'Template was deployed successfully', statusCode: 200};
    } catch (e) {
      this.logger.error({label: 'Error deploying GateKeeper constraint template', data: { clusterId, templateName }}, e, 'ClusterService.deployOPAGateKeeperConstraintTemplates');
      if (e.statusCode === 409) {
        return {message: 'Template already exists', statusCode: e.statusCode};
      }
      return {message: 'Failed to deploy the template', statusCode: e.statusCode};
    }
  }

  async getOPAGateKeeperConstraintTemplateByName(clusterId: number, templateName: string): Promise<GatekeeperTemplateDto> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const templateResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', templateName);
      const template= templateResponse.body;
      const templateDto = plainToInstance(GatekeeperTemplateDto, template)
      return templateDto;
    }
    catch(e) {
      this.logger.error({label: 'Error getting GateKeeper constraint template by name', data: { clusterId, templateName }}, e, 'ClusterService.getOPAGateKeeperConstraintTemplateByName');
    }
  }

  async getOPAGateKeeperConstraintTemplateByNameRaw(clusterId: number, templateName: string): Promise<any> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const templateResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', templateName);
      const template= templateResponse.body;
      return JSON.stringify(template);
    }
    catch(e) {
      this.logger.error({label: 'Error getting raw GateKeeper constraint template by name', data: { clusterId, templateName }}, e, 'ClusterService.getOPAGateKeeperConstraintTemplateByNameRaw');
    }
  }

  async destroyOPAGateKeeperConstraintTemplateByName(clusterId: number, templateName: string): Promise<{message: string; status: number}> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const getConstraints: GatekeeperConstraintDetailsDto[] = await this.gateKeeperTemplateConstraintsDetails(clusterId, templateName);
      if(getConstraints.length) {
        await Promise.all(getConstraints.map(constraint => {
          customObjectApi.deleteClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, constraint.metadata.name);
        }));
      }
      const destroyTemplate = await customObjectApi.deleteClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', templateName);
      return {message: `${templateName} and related constraints were deleted successfully`, status: 200};
    }
    catch(e) {
      this.logger.error({label: 'Error deleting GateKeeper constraint template by name', data: { clusterId, templateName }}, e, 'ClusterService.destroyOPAGateKeeperConstraintTemplateByName');
    }
  }

  async loadGatekeeperTemplate(dir: string, subDir: string, clusterId: number): Promise<GatekeeperTemplateDto> {
    const templateDir = `${this.configService.get('gatekeeper.gatekeeperTemplateDir')}/../cluster-${clusterId}-gatekeeper-templates`;
    const templatePath = `${templateDir}/${dir}/${subDir}/template.yaml`;
    try {
      const template = jsYaml.load(fs.readFileSync(templatePath, 'utf-8'));
      const templateToDto = plainToInstance(GatekeeperTemplateDto, template);
      this.logger.log({label: 'Retrieved GateKeeper template', data: { clusterId, templateToDto }}, 'ClusterService.loadGatekeeperTemplate');
      return templateToDto;
    } catch (e) {
      this.logger.error({label: 'Error retrieving GateKeeper template', data: { clusterId, dir, subDir }}, e, 'ClusterService.loadGatekeeperTemplate');
      return null;
    }
  }

  async loadRawGatekeeperTemplate(dir: string, subDir: string, clusterId: number): Promise<any> {
    const templateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    const templatePath = `${templateDir}/../cluster-${clusterId}-gatekeeper-templates/${dir}/${subDir}/template.yaml`;
    try {
      const template = jsYaml.load(fs.readFileSync(templatePath, 'utf-8'));
      return template;
    } catch (e) {
      this.logger.error({label: 'Error loading raw GateKeeper template', data: { clusterId, dir, subDir }}, e, 'ClusterService.loadRawGatekeeperTemplate');
      return null;
    }
  }

  async deployRawOPAGateKeeperConstraintTemplates(clusterId: number, template: any): Promise<{message: string, statusCode: number}> {
    const rawTemplate = JSON.parse(template);
    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const deployedTemplate = await customObjectApi.createClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', rawTemplate);
      this.logger.log({label: 'Deploying GateKeeper constraint template', data: { clusterId, deployedTemplate }}, 'ClusterService.deployRawOPAGateKeeperConstraintTemplates');
      return {message: 'Template was deployed successfully', statusCode: 200};
    } catch (e) {
      this.logger.error({label: 'Error deploying GateKeeper constraint template', data: { clusterId, template }}, e, 'ClusterService.deployRawOPAGateKeeperConstraintTemplates');
      if (e.statusCode === 409) {
        return await this.patchGateKeeperTemplate(clusterId, rawTemplate);
      }
      return {message: 'Failed to deploy the template', statusCode: e.statusCode};
    }
  }

  async patchGateKeeperTemplate(clusterId: number, template: any): Promise<{message: string, statusCode: number}> {
    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const options = { 'headers': { 'Content-type': PatchUtils.PATCH_FORMAT_JSON_PATCH }};

      const patchMetadataName = {op: 'replace', path: '/metadata/name', value: template.metadata.name };
      const patchMetadataAnnotations = {op: 'replace', path: '/metadata/annotations', value: template.metadata.annotations };
      const patchSpecKind = {op: 'replace', path: '/spec/crd/spec/names/kind', value: template.spec.crd.spec.names.kind };
      // const patchSpecTargets = {op: 'replace', path: '/spec/targets', value: template.spec.targets };

      const patchTemplate = await customObjectApi.patchClusterCustomObject('templates.gatekeeper.sh',
          'v1beta1', 'constrainttemplates', template.metadata.name,
          [patchMetadataName, patchMetadataAnnotations, patchSpecKind], undefined, undefined, undefined, options);
      this.logger.log({label: 'Patched GateKeeper template successfully', data: { clusterId, template }}, 'ClusterService.patchGateKeeperTemplate');
      return {message: 'Patched the template successfully', statusCode: patchTemplate.response.statusCode};
    } catch (e) {
      this.logger.error({label: 'Error patching GateKeeper template', data: { clusterId, template }}, e, 'ClusterService.patchGateKeeperTemplate');
      return {message: 'Could not Path the template', statusCode: e.statusCode};
    }
  }

  async gateKeeperTemplateConstraintsCount(clusterId: number, templateName: string): Promise<number> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      return response.body['items'].length;
    }
    catch(e) {
      this.logger.error({label: 'Error counting GateKeeper constraints - assuming none exist ', data: { clusterId, templateName }}, e, 'ClusterService.gateKeeperTemplateConstraintsCount');
      return 0;
    }
  }

  async gateKeeperTemplateConstraintsDetails(clusterId: number, templateName: string): Promise<GatekeeperConstraintDetailsDto[]> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      const constraintsDetails: any[] = response.body['items'];
      const data = plainToInstance(GatekeeperConstraintDetailsDto, constraintsDetails);
      return plainToInstance(GatekeeperConstraintDetailsDto, constraintsDetails);
    }
    catch(e) {
      this.logger.error({label: 'Error retrieving GateKeeper template constraint details - assuming none exist', data: { clusterId, templateName }}, e, 'ClusterService.gateKeeperTemplateConstraintsDetails');
      return [];
    }
  }

  async listGateKeeperTemplateConstraints(clusterId: number): Promise<GateKeeperConstraintViolation[]> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    const violationList: any = [];
    try {
      const templates = await customObjectApi.listClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates');
      const templateNames: any[] = templates.body['items'].map(t => t.metadata.name);

      for( const templateName of templateNames) {
        const constraints = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
        const constraintDetails: any[] = constraints.body['items'];
        const constraintDetailsDto = plainToInstance(GatekeeperConstraintDetailsDto, constraintDetails);
        for(const constraint of constraintDetailsDto) {
          if (constraint.status?.violations?.length) {
            violationList.push(constraint.status.violations);
          }
        }
      }
      return violationList.flat();
    }
    catch(e) {
      this.logger.error({label: 'Error retrieving GateKeeper template constraint details - assuming none exist', data: { clusterId }}, e, 'ClusterService.listGateKeeperTemplateConstraints');
      return [];
    }
  }

  async createOPAGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number): Promise<{message: string, statusCode: number}> {
    this.logger.log({label: 'Going to create GateKeeper Template Constraint', data: { templateName, clusterId, constraint }}, 'ClusterService.createOPAGateKeeperTemplateConstraint');
    const gatekeeperConstraintDto = new GatekeeperConstraintDetailsDto();
    gatekeeperConstraintDto.metadata = new GatekeeperConstraintMetadata();
    gatekeeperConstraintDto.metadata.annotations= new GatekeeperConstraintMetadataAnnotations();

    gatekeeperConstraintDto.apiVersion = 'constraints.gatekeeper.sh/v1beta1';
    gatekeeperConstraintDto.kind = constraint.kind;
    gatekeeperConstraintDto.metadata.name = constraint.name;
    gatekeeperConstraintDto.metadata.annotations.description = constraint.description;

    gatekeeperConstraintDto.metadata.annotations.mode = String(constraint.mode).toLowerCase() === 'dryrun' ? 'Audit' : 'Enforce';

    gatekeeperConstraintDto.spec = new GatekeeperConstraintSpec();
    gatekeeperConstraintDto.spec.match = new GatekeeperConstraintSpecMatch();
    gatekeeperConstraintDto.spec.match.kinds = [];
    gatekeeperConstraintDto.spec.match.excludedNamespaces = constraint.excludedNamespaces;
    // gatekeeperConstraintDto.spec.match.namespaces = constraint.namespaces;
    if (constraint.criterias) {
      for(const criteria of constraint.criterias) {
        const tempKind = new GatekeeperConstraintSpecMatchKind();
        tempKind.kinds = criteria.kinds;
        tempKind.apiGroups = criteria.apiGroups.length? criteria.apiGroups : [""] ;
        gatekeeperConstraintDto.spec.match.kinds.push(tempKind);
      }
    }

    gatekeeperConstraintDto.spec.parameters = constraint.properties;

    /**
     * enforcementAction = dryrun allows constraints to be tested in a running cluster without enforcing them
     * Resources that are impacted by the dry run constraint are surfaced as
     * violations in the status field of the constraint.
     * enforcementAction = deny will enforce policies
     * **/
    gatekeeperConstraintDto.spec.enforcementAction = String(constraint.mode).toLowerCase();

    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const createdConstraint = await customObjectApi.createClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, gatekeeperConstraintDto);
      this.logger.log({label: 'GateKeeper Template Constraint Created', data: { templateName, clusterId, createdConstraint }}, 'ClusterService.createOPAGateKeeperTemplateConstraint');
      return {message: 'Constraint created successfully', statusCode: 200};
    } catch(e) {
      this.logger.error({label: 'GateKeeper Template Constraint Created', data: { templateName, clusterId, constraint }}, e, 'ClusterService.createOPAGateKeeperTemplateConstraint');
      return {message: e.body.message, statusCode: e.statusCode};
    }
  }

  async patchOPAGateKeeperTemplateConstraint(constraint: any, templateName: string, clusterId: number): Promise<{message: string, statusCode: number}> {
    this.logger.log({label: 'Going to patch GateKeeper Template Constraint', data: { templateName, clusterId, constraint }}, 'ClusterService.patchOPAGateKeeperTemplateConstraint');
    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const options = { 'headers': { 'Content-type': PatchUtils.PATCH_FORMAT_JSON_PATCH }};

      const patchEnforcementAction = {op: 'replace', path: '/spec/enforcementAction', value: constraint.mode };
      const patchDescription = {op: 'replace', path: '/metadata/annotations/description', value: constraint.description };
      const patchLabels = {op: 'replace', path: '/spec/parameters', value: constraint.properties };
      const patchExcludedNamespaces = {op: 'replace', path: '/spec/match/excludedNamespaces', value: constraint.excludedNamespaces };
      const patchKinds = {op: 'replace', path: '/spec/match/kinds', value: constraint.criterias };

      const patchedConstraint = await customObjectApi.patchClusterCustomObject('constraints.gatekeeper.sh',
          'v1beta1', templateName, constraint.name, [patchDescription, patchEnforcementAction, patchLabels, patchExcludedNamespaces, patchKinds], undefined, undefined, undefined, options);

      return {message: `${constraint.name} has been patched successfully`, statusCode: 200};
    } catch (e) {
      this.logger.error({label: 'Error patching Gatekeeper Template Constraint', data: { templateName, clusterId, constraint }}, e, 'ClusterService.patchOPAGateKeeperTemplateConstraint');
      return {message: 'Error patching Gatekeeper Template Constraint', statusCode: e.statusCode};
    }
  }

  async destroyOPAGateKeeperTemplateConstraintByName(clusterId: number, templateName: string, constraintName: string): Promise<{message: string, statusCode: number}> {
    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const deletedConstraint = await customObjectApi.deleteClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, constraintName);
      return {message: `${constraintName} has been deleted successfully`, statusCode: 200};
    } catch (e) {
      this.logger.error({label: 'Error destroying GateKeeper Template Constraint by name', data: { templateName, clusterId, constraintName }}, e, 'ClusterService.destroyOPAGateKeeperTemplateConstraintByName');
      return {message: e.body.message, statusCode: e.statusCode};
    }
  }

  async syncDeployedGatekeeperTemplatesWithExceptionBlock(exceptionBlock: string, clusterId: number): Promise<void> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    const options = { 'headers': { 'Content-type': PatchUtils.PATCH_FORMAT_JSON_PATCH }};
    try {
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '')
      const templates: any[] = templateListResponse.body['items'];
      for (const template of templates) {
        if (Object.keys(template.metadata.annotations).includes('minesweeper.io/exceptions')){
          if(template.spec.targets) {
            for(const target of template.spec.targets) {
              target.rego = exceptionBlock;
            }
          }
        }
        const patchSpecTargets = {op: 'replace', path: '/spec/targets', value: template.spec.targets };

        const patchTemplate = await customObjectApi.patchClusterCustomObject('templates.gatekeeper.sh',
            'v1beta1', 'constrainttemplates', template.metadata.name,
            [patchSpecTargets], undefined, undefined, undefined, options);
      }
    }
    catch(e) {
      this.logger.error({label: 'Error syncing GateKeeper Template with exception block', data: { exceptionBlock, clusterId }}, e, 'ClusterService.syncDeployedGatekeeperTemplatesWithExceptionBlock');
    }
  }

  async getDeployedTemplateList(clusterId: number): Promise<string[]> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '');
      const templates: any[] = templateListResponse.body['items'];
      return templates.map(t => t.metadata.name);
    } catch (e) {
      this.logger.error({label: 'Error getting deployed GateKeeper Template list - assuming there are none', data: { clusterId }}, e, 'ClusterService.getDeployedTemplateList');
      return [];
    }
  }

  async patchTemplateWithModifiedRego(templateName: string, templateWithModifiedRego: any,  clusterId: number): Promise<void> {
    const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    const options = { 'headers': { 'Content-type': PatchUtils.PATCH_FORMAT_JSON_PATCH }};
    const patchSpecTargets = {op: 'replace', path: '/spec/targets', value: templateWithModifiedRego.spec.targets };

    try {
      const patchTemplate = await customObjectApi.patchClusterCustomObject('templates.gatekeeper.sh',
          'v1beta1', 'constrainttemplates', templateName,
          [patchSpecTargets], undefined, undefined, undefined, options);
      this.logger.log({label: 'Patched Gatekeeper Template with modified Rego', data: { clusterId, templateName, templateWithModifiedRego, statusCode: patchTemplate.response.statusCode }}, 'ClusterService.patchTemplateWithModifiedRego');
    } catch (e) {
      this.logger.error({label: 'Error patching GateKeeper Template with modified Rego', data: { clusterId, templateName, templateWithModifiedRego }}, e, 'ClusterService.patchTemplateWithModifiedRego');
    }


  }

  async getNamespacesByCluster(clusterId: number): Promise<string[]> {
    try {
      const kubeConfig: KubeConfig = await this.getKubeConfig(clusterId);
      const k8sCoreApi = kubeConfig.makeApiClient(CoreV1Api);
      const namespaces = await k8sCoreApi.listNamespace();
      const namespaceNames =  namespaces.body.items.map(namespace => namespace.metadata.name);
      // const kubeSystemIndex = namespaceNames.indexOf('kube-system');
      // namespaceNames.splice(kubeSystemIndex, 1);
      return namespaceNames;
    } catch (e) {
      this.logger.error({label: 'Error getting namespaces by cluster', data: { clusterId }}, e, 'ClusterService.getNamespacesByCluster');
      return [];
    }
  }

  async calculateClusterMetaData(previous: ClusterDto, updated: ClusterDto): Promise<any> {
    return await this.auditLogService.calculateMetaData(previous, updated, 'Cluster');
  }


}
