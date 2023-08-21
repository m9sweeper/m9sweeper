import { forwardRef, HttpException, Inject, Injectable } from '@nestjs/common';
import { ClusterService } from '../../cluster/services/cluster.service';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { GatekeeperResponseStructure } from '../dto/gatekeeper-generic.dto';
import { CustomObjectsApi, V1APIService } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { ApiregistrationV1Api } from '@kubernetes/client-node/dist/gen/api/apiregistrationV1Api';
import { GatekeeperConstraintTemplateDto } from '../dto/gatekeeper-constraint-template.dto';
import { plainToInstance } from 'class-transformer';
import { GatekeeperConstraintDto } from '../dto/gatekeeper-constraint.dto';
import * as jsYaml from 'js-yaml';

@Injectable()
export class GatekeeperConstraintService {
  defaultTemplateDir: string;
  constructor(
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    private readonly configService: ConfigService,
    private logger: MineLoggerService,
  ) {
    this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
  }

  async getConstraintsForTemplate(clusterId: number, templateName: string, kubeConfig?: KubeConfig): Promise<GatekeeperConstraintDto[]> {
    if (!kubeConfig) {
      kubeConfig = await this.clusterService.getKubeConfig(clusterId);
    }
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      return plainToInstance(GatekeeperConstraintDto, response.body['items']) as unknown as GatekeeperConstraintDto[];
    }
    catch(e) {
      this.logger.error({label: 'Error counting Gatekeeper constraints - assuming none exist ', data: { clusterId, templateName }}, e, 'GatekeeperConstraintService.gatekeeperTemplateConstraintsCount');
      return [];
    }
  }

  async createConstraintForTemplate(clusterId: number, templateName: string, constraint: any, kubeConfig?: KubeConfig): Promise<GatekeeperConstraintDto> {
    if (!kubeConfig) {
      kubeConfig = await this.clusterService.getKubeConfig(clusterId);
    }

    // gatekeeperConstraintDto.metadata.annotations.mode = String(constraint.mode).toLowerCase() === 'dryrun' ? 'Audit' : 'Enforce';
    const newConstraint = constraint as GatekeeperConstraintDto;
    // newConstraint.metadata.annotations.mode = String(newConstraint.mode).toLowerCase() === 'dryrun' ? 'Audit' : 'Enforce';
    // return newConstraint;
    try {
      const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
      const createdConstraint = await customObjectApi.createClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, newConstraint);
      this.logger.log({label: 'Gatekeeper Constraint Created', data: { templateName, clusterId, createdConstraint }}, 'GatekeeperConstraintService.createConstraintForTemplate');
      return newConstraint;
    } catch(e) {
      this.logger.error({label: 'Gatekeeper Constraint Created', data: { templateName, clusterId, constraint }}, e, 'GatekeeperConstraintService.createConstraintForTemplate');
      throw new HttpException({message: e.body.message}, e.statusCode);
    }
  }

  async deleteConstraintsForTemplate(clusterId: number, templateName: string, kubeConfig?: KubeConfig): Promise<{
    constraintsExisted: boolean;
    successfullyDeleted?: string[];
    notDeleted?: string[];
  }> {
    if (!kubeConfig) {
      kubeConfig = await this.clusterService.getKubeConfig(clusterId);
    }

    const constraints = await this.getConstraintsForTemplate(clusterId, templateName, kubeConfig);
    if (!constraints.length) {
      return { constraintsExisted: false };
    }

    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    const constraintDeletePromises = [];
    constraints.forEach(constraint => {
      constraintDeletePromises.push(
        customObjectApi.deleteClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, constraint.metadata.name)
      );
    })

    const results = await Promise.allSettled(constraintDeletePromises);
    const successfullyDeleted = [];
    const notDeleted = [];

    results.forEach((constraintDeletedResult) => {
      if (constraintDeletedResult.status === "fulfilled") {
        successfullyDeleted.push(constraintDeletedResult.value.response.body.metadata.name);
        return;
      }
      // rejected
      notDeleted.push(constraintDeletedResult.reason.body.message);
      return;
    });

    return {
      constraintsExisted: true,
      successfullyDeleted,
      notDeleted
    }
  }
}
