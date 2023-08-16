import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClusterService } from '../../cluster/services/cluster.service';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { GatekeeperResponseStructure } from '../dto/gatekeeper-generic.dto';
import { CustomObjectsApi, V1APIService } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node/dist/config';
import { ApiregistrationV1Api } from '@kubernetes/client-node/dist/gen/api/apiregistrationV1Api';
import { GatekeeperConstraintTemplateDto } from '../dto/gatekeeper-constraint-template.dto';
import { plainToInstance } from 'class-transformer';

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

  async getNumConstraintsForTemplate(clusterId: number, templateName: string, kubeConfig?: KubeConfig): Promise<number> {
    const constraints = await this.getConstraintsForTemplate(clusterId, templateName, kubeConfig);
    return constraints.length;
  }

  async getConstraintsForTemplate(clusterId: number, templateName: string, kubeConfig?: KubeConfig): Promise<any[]> {
    if (!kubeConfig) {
      kubeConfig = await this.clusterService.getKubeConfig(clusterId);
    }
    const customObjectApi = kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const response = await customObjectApi.getClusterCustomObject('constraints.gatekeeper.sh', 'v1beta1', templateName, '');
      return response.body['items'];
    }
    catch(e) {
      this.logger.error({label: 'Error counting Gatekeeper constraints - assuming none exist ', data: { clusterId, templateName }}, e, 'ClusterService.gatekeeperTemplateConstraintsCount');
      return [];
    }
  }
}
