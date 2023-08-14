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
import { GatekeeperTemplateDto } from '../dto/gatekeeper-template-dto';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { CustomObjectsApi, HttpError } from '@kubernetes/client-node';
import { ClusterService } from './cluster.service';
import { plainToInstance } from 'class-transformer';
import * as jsYaml from 'js-yaml';
import * as fs from "fs";
import { GatekeeperConstraintDetailsDto } from '../dto/gatekeeper-constraint-dto';

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

  async getConstraintTemplates(clusterId: number): Promise<GatekeeperTemplateDto[]> {
    try {
      const kubeConfig: KubeConfig = await this.clusterService.getKubeConfig(clusterId);
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '');
      const templates: any[] = templateListResponse.body['items'];
      const templatesDto: GatekeeperTemplateDto[] = plainToInstance(GatekeeperTemplateDto, templates);
      for(const template of templatesDto) {
        const constraintCount = await this.gatekeeperTemplateConstraintsCount(kubeConfig, clusterId, template.metadata.name);
        template.constraintsCount = constraintCount;
        template.enforced = !!constraintCount;
      }
      return templatesDto;
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
      const gatekeeperTemplate = jsYaml.load(template.template) as GatekeeperTemplateDto;
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


  private validateConstraintTemplate(template: string): { isValid: boolean, reason?: string } {
    let templateAsObject: GatekeeperTemplateDto;
    try {
      templateAsObject = jsYaml.load(template) as GatekeeperTemplateDto;
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
}
