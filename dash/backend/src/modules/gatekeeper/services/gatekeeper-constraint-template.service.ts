import { BadRequestException, forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { ClusterService } from '../../cluster/services/cluster.service';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { CustomObjectsApi } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { GatekeeperConstraintTemplateDto } from '../dto/gatekeeper-constraint-template.dto';
import { plainToInstance } from 'class-transformer';
import { GatekeeperConstraintService } from './gatekeeper-constraint.service';
import * as jsYaml from 'js-yaml';

@Injectable()
export class GatekeeperConstraintTemplateService {
  defaultTemplateDir: string;
  constructor(
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    private readonly configService: ConfigService,
    private readonly gatekeeperConstraintService: GatekeeperConstraintService,
    private logger: MineLoggerService,
  ) {
    this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
  }
  private validateConstraintTemplate(template: string): { isValid: boolean, reason?: string } {
    let templateAsObject: GatekeeperConstraintTemplateDto;
    try {
      templateAsObject = jsYaml.load(template) as GatekeeperConstraintTemplateDto;
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

  async getConstraintTemplates(clusterId: number, kubeConfig?: KubeConfig): Promise<GatekeeperConstraintTemplateDto[]> {
    try {
      if (!kubeConfig) {
        kubeConfig = await this.clusterService.getKubeConfig(clusterId);
      }
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const templateListResponse = await customObjectApi.getClusterCustomObject('templates.gatekeeper.sh', 'v1beta1', 'constrainttemplates', '');
      const templates: any[] = templateListResponse.body['items'];
      const templateDTOs: GatekeeperConstraintTemplateDto[] = plainToInstance(GatekeeperConstraintTemplateDto, templates);
      for(const template of templateDTOs) {
        const constraintCount = await this.gatekeeperConstraintService.getNumConstraintsForTemplate(clusterId, template.metadata.name, kubeConfig);
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
  ): Promise<{ successfullyDeployed: string[], unsuccessfullyDeployed: string[] }> {
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
      const gatekeeperTemplate = jsYaml.load(template.template) as GatekeeperConstraintTemplateDto;
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
}
