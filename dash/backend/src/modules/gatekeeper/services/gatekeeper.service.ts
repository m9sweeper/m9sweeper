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
import { GatekeeperConstraintService } from './gatekeeper-constraint.service';
import { GatekeeperConstraintTemplateService } from './gatekeeper-constraint-template.service';
import { GatekeeperConstraintTemplateBlueprintService } from './gatekeeper-constraint-template-blueprint.service';

@Injectable()
export class GatekeeperService {
  defaultTemplateDir: string;
  constructor(
    @Inject(forwardRef(() => ClusterService))
    private readonly clusterService: ClusterService,
    private readonly configService: ConfigService,
    private readonly gatekeeperConstraintTemplateBlueprintService: GatekeeperConstraintTemplateBlueprintService,
    private readonly gatekeeperConstraintTemplateService: GatekeeperConstraintTemplateService,
    private readonly gatekeeperConstraintService: GatekeeperConstraintService,
    private logger: MineLoggerService,
  ) {
    this.defaultTemplateDir = this.configService.get('gatekeeper.gatekeeperTemplateDir');
  }

  async getInstallationInfo(clusterId: number): Promise<GatekeeperResponseStructure<{
    constraints: GatekeeperConstraintTemplateDto[],
    gatekeeperResource: Partial<V1APIService>,
  }>> {
    this.logger.log({ label: 'Retrieving Gatekeeper installation info for cluster', clusterId }, 'GatekeeperService.getInstallationInfo');
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
      delete resource.body.metadata.uid;
      let gatekeeperTemplates: GatekeeperConstraintTemplateDto[] = [];
      try {
        gatekeeperTemplates = await this.gatekeeperConstraintTemplateService.getConstraintTemplates(clusterId);
        return {
          status: gatekeeperIsInstalled,
          message: gatekeeperTemplates.length ? 'Setup' : 'Not Setup',
          data: {
            constraints: gatekeeperTemplates,
            gatekeeperResource: resource.body,
          },
        };
      } catch (e) {
        return {
          status: gatekeeperIsInstalled,
          message: 'Not Setup',
          error: e,
          data: {
            constraints: gatekeeperTemplates,
            gatekeeperResource: resource.body,
          },
        };
      }
    } catch (e) {
      this.logger.error({label: 'Error getting Gatekeeper installation information', data: { clusterId }}, e, 'GatekeeperService.getInstallationInfo');
      return {status: gatekeeperIsInstalled, message: 'Not Installed', error: e};
    }
  }
}
