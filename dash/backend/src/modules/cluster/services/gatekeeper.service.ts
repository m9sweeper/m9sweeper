import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { ConfigService } from '@nestjs/config';
import { DeprecatedGatekeeperTemplateDto } from '../dto/deprecated-gatekeeper-template-dto';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { CustomObjectsApi, HttpError, V1APIService } from '@kubernetes/client-node';
import { ClusterService } from './cluster.service';
import { plainToInstance } from 'class-transformer';
import * as jsYaml from 'js-yaml';
import * as fs from "fs";
import { GatekeeperConstraintDetailsDto } from '../dto/deprecated-gatekeeper-constraint-dto';
import { ApiregistrationV1Api } from '@kubernetes/client-node/dist/gen/api/apiregistrationV1Api';

@Injectable()
export class GatekeeperService {
  defaultTemplateDir: string;
  constructor(
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    private readonly configService: ConfigService,
    private logger: MineLoggerService,
    ) {
    this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
  }

  private validateConstraintTemplate(template: string): { isValid: boolean, reason?: string } {
    let templateAsObject: DeprecatedGatekeeperTemplateDto;
    try {
      templateAsObject = jsYaml.load(template) as DeprecatedGatekeeperTemplateDto;
    } catch (e) {
      this.logger.log('New Gatekeeper constraint template failed validation: not a valid yaml object', 'GatekeeperService.validateConstraintTemplate');
      return { isValid: false, reason: 'Template is not a valid yaml object' };
    }

    if (templateAsObject.metadata.name !== templateAsObject.spec.crd.spec.names.kind.toLowerCase()) {
      return {
        isValid: false,
        reason: `Template's name must match the lowercase of the CRD's kind: ${templateAsObject.spec.crd.spec.names.kind.toLowerCase()}`,
      }
    }

    return { isValid: true };
  }
  private async readFolderNames(pathName: string): Promise<string[]> {
    try {
      const readDirNamesFromFile = jsYaml.load(fs.readFileSync(pathName, 'utf-8')) as any;
      return readDirNamesFromFile.resources;
    } catch (e) {
      this.logger.error({label: 'Could not read file at path', data: { pathName }}, e, 'ClusterService.readFolderNames');
      return [];
    }
  }

  private sanitizeGatekeeperAPIService(rawAPIService: V1APIService): Partial<V1APIService> {
    delete rawAPIService.metadata.uid;
    return rawAPIService;
  }

  private async getRawConstraintTemplateByName(clusterId: number, templateName: string): Promise<object> {
    const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const templateResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', templateName);
      return templateResponse.body;
    }
    catch(e) {
      this.logger.error({label: 'Error getting Gatekeeper constraint template by name', data: { clusterId, templateName }}, e, 'GatekeeperService.getRawConstraintTemplateByName');
      return;
    }
  }

  async gatekeeperTemplateConstraintsCount(kubeConfig: KubeConfig, clusterId, templateName: string): Promise<number> {
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      return response.body['items'].length;
    }
    catch(e) {
      this.logger.error({label: 'Error counting Gatekeeper constraints - assuming none exist ', data: { clusterId, templateName }}, e, 'ClusterService.gatekeeperTemplateConstraintsCount');
      return 0;
    }
  }

  async getConstraintTemplates(clusterId: number): Promise<DeprecatedGatekeeperTemplateDto[]> {
    try {
      const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '');
      const templates: any[] = templateListResponse.body['items'];
      const templateDTOs: DeprecatedGatekeeperTemplateDto[] = plainToInstance(DeprecatedGatekeeperTemplateDto, templates);
      for(const template of templateDTOs) {
        const constraintCount = await this.gatekeeperTemplateConstraintsCount(kubeConfig, clusterId, template.metadata.name);
        template.constraintsCount = constraintCount;
        template.enforced = !!constraintCount;
      }
      return templateDTOs;
    } catch (e) {
      this.logger.error({label: 'Error getting Gatekeeper constraint templates', data: { clusterId }}, e, 'GatekeeperService.getConstraintTemplates');
      throw({message: 'Error getting Gatekeeper constraint templates'});
    }
  }

  async createConstraintTemplates(
    clusterId: number,
    templates: { name: string, template: string }[]
  ): Promise<{ successfullyDeployed: any[], unsuccessfullyDeployed: any[] }> {
    if (!templates.length) {
      throw new BadRequestException('Please include constraint templates to create in the body of the request');
    }

    const validationErrors = [];
    templates.forEach((template) => {
      const validationResult = this.validateConstraintTemplate(template.template);
      if (!validationResult.isValid) {
        validationErrors.push({ templateName: template.name, reason: validationResult.reason });
      }
    });
    if (validationErrors.length) {
      this.logger.log({label: 'New Gatekeeper constraint template(s) failed validation', data: validationErrors}, 'GatekeeperService.createConstraintTemplates');
      throw new BadRequestException({ data: validationErrors, message: 'Template(s) failed validation' });
    }

    const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);

    const createTemplatePromises = [];
    templates.forEach((template) => {
      const gatekeeperTemplate = jsYaml.load(template.template) as DeprecatedGatekeeperTemplateDto;
      const templateDeployPromise = customObjectApi.createClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', gatekeeperTemplate);
      createTemplatePromises.push(templateDeployPromise);
    });

    const results = await Promise.allSettled(createTemplatePromises);

    const successfullyDeployed = [];
    const unsuccessfullyDeployed = [];
    results.forEach((templateDeployedResult) => {
      if (templateDeployedResult.status === "fulfilled") {
        successfullyDeployed.push(templateDeployedResult.value.response.body.metadata.name);
        return;
      }
      // rejected
      unsuccessfullyDeployed.push(templateDeployedResult.reason.body.message);
      return;
    });

    this.logger.log({
      label: 'Attempted to deploy new Gatekeeper constraint templates',
      data: {
        clusterId, numTemplates: templates.length,
        successfullyDeployed, unsuccessfullyDeployed,
      },
    }, 'GatekeeperService.createConstraintTemplates');
    if (successfullyDeployed.length && unsuccessfullyDeployed.length) {
      throw new HttpException({ data: {successfullyDeployed, unsuccessfullyDeployed}, message: 'Some templates deployed; others did not' }, 400);
    } else if (unsuccessfullyDeployed.length) {
      throw new HttpException({ data: {successfullyDeployed, unsuccessfullyDeployed}, message: 'Failed to deploy the templates' }, 400);
    } else {
      return {successfullyDeployed, unsuccessfullyDeployed};
    }
  }

  async getConstraintTemplateByName(clusterId: number, templateName: string): Promise<{
    associatedConstraints: GatekeeperConstraintDetailsDto[],
    constraintTemplate: DeprecatedGatekeeperTemplateDto,
    rawConstraintTemplate: string,
  }> {
    try {
      const template= await this.getRawConstraintTemplateByName(clusterId, templateName);
      if (!template) {
        throw new Error('Could not retrieve the raw constraint template by name');
      }
      const templateDto = plainToInstance(DeprecatedGatekeeperTemplateDto, template)
      const associatedConstraints = await this.getConstraintsForTemplate(clusterId, templateName);
      return {
        associatedConstraints,
        constraintTemplate: templateDto,
        rawConstraintTemplate: JSON.stringify(template),
      };
    }
    catch(e) {
      this.logger.error({label: 'Error getting Gatekeeper constraint template by name', data: { clusterId, templateName }}, e, 'GatekeeperService.getConstraintTemplateByName');
    }
  }

  async getConstraintTemplateAsString(clusterId: number, templateName: string): Promise<string> {
    const template= await this.getRawConstraintTemplateByName(clusterId, templateName);
    return JSON.stringify(template);
  }

  async getConstraintTemplateTemplateTitles(clusterId: number): Promise<{ [dirName: string]: string []}> {
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

  async getConstraintTemplateTemplates(clusterId: number): Promise<{
    category: string;
    templates: {
      name: string,
      template: GatekeeperConstraintDetailsDto | string,
    }[]
  }[]> {
    const directories = await this.getConstraintTemplateTemplateTitles(clusterId);
    const templates: {
      category: string;
      templates: {
        name: string,
        template: GatekeeperConstraintDetailsDto | string,
      }[]
    }[] = [];
    const templateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
    for (const directoryName of Object.keys(directories)) {
      const templatesInDirectory = {
        category: directoryName,
        templates: [],
      };
      for (const templateName of directories[directoryName]) {
        templatesInDirectory.templates.push({
          name: templateName,
          template: jsYaml.load(fs.readFileSync(`${templateDir}/${directoryName}/${templateName}/template.yaml`, 'utf-8')),
        });
      }
      templates.push(templatesInDirectory);
    }
    return templates;
  }

  async getInstallationInfo(clusterId: number): Promise<{
    status: boolean,
    message: string,
    error?: any,
    data?: {
      constraints: DeprecatedGatekeeperTemplateDto[],
      gatekeeperResource: Partial<V1APIService>,
    },
  }> {
    const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
    const apiRegistration = kubeConfig.makeApiClient(ApiregistrationV1Api);
    let gatekeeperIsInstalled = false;
    try {
      const resource = await apiRegistration.readAPIService('v1beta1.templates.gatekeeper.sh');
      this.logger.log({label: 'Gatekeeper installation retrieved', data: { clusterId, statusCode: resource.response.statusCode, status: resource.body.status }}, 'GatekeeperService.getInstallationInfo');
      // check that the latest condition's status is "True"
      if (resource?.body?.status?.conditions?.length) {
        gatekeeperIsInstalled = resource.body.status.conditions[0].type === "Available" && resource.body.status.conditions[0].status === "True";
      }
      if (!gatekeeperIsInstalled) {
        return {status: gatekeeperIsInstalled, message: 'Not Installed'};
      }
      let gatekeeperTemplates: DeprecatedGatekeeperTemplateDto[] = [];
      try {
        gatekeeperTemplates = await this.getConstraintTemplates(clusterId);
        return {
          status: gatekeeperIsInstalled,
          message: gatekeeperTemplates.length ? 'Setup' : 'Not Setup',
          data: {
            constraints: gatekeeperTemplates,
            gatekeeperResource: this.sanitizeGatekeeperAPIService(resource.body),
          },
        };
      } catch (e) {
        return {
          status: gatekeeperIsInstalled,
          message: 'Not Setup',
          error: e,
          data: {
            constraints: gatekeeperTemplates,
            gatekeeperResource: this.sanitizeGatekeeperAPIService(resource.body),
          },
        };
      }
    } catch (e) {
      this.logger.error({label: 'Error getting Gatekeeper installation information', data: { clusterId }}, e, 'GatekeeperService.getInstallationInfo');
      return {status: gatekeeperIsInstalled, message: 'Not Installed', error: e};
    }
  }

  async getConstraintsForTemplate(clusterId: number, templateName: string): Promise<GatekeeperConstraintDetailsDto[]> {
    const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      const constraintsDetails: any[] = response.body['items'];
      return plainToInstance(GatekeeperConstraintDetailsDto, constraintsDetails);
    }
    catch(e) {
      this.logger.error({label: 'Error retrieving GateKeeper template constraint details - assuming none exist', data: { clusterId, templateName }}, e, 'ClusterService.gateKeeperTemplateConstraintsDetails');
      return [];
    }
  }
}
