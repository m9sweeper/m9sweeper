import {
  Body,
  Controller, HttpCode,
  Param,
  Post, Req,
} from '@nestjs/common';
import { AdmissionReviewDto } from '../dto/admission-review.dto';
import { AdmissionReviewReplyDto, AdmissionReviewReplyResponseStatus } from '../dto/admission-review-reply.dto';
import { ClusterValidationService } from '../services/cluster-validation.service';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { MineLoggerService } from '../../shared/services/mine-logger.service';
import { ClusterEventService } from '../../cluster-event/services/cluster-event.service';
import {PrometheusV1Service} from '../../metrics/services/prometheus-v1.service';

@Controller()
export class ClusterValidationController {
  constructor(
    private clusterValidationService: ClusterValidationService,
    private readonly configService: ConfigService,
    private readonly logger: MineLoggerService,
    private readonly clusterEventService: ClusterEventService,
    private readonly prometheusService: PrometheusV1Service
  ) {}

  @Post()
  // @AllowedAuthorityLevels(Authority.SUPER_ADMIN, Authority.ADMIN)
  // @UseGuards(AuthGuard, AuthorityGuard)
  @HttpCode(200)
  async validateRequest(@Req() request: Request, @Body() body: AdmissionReviewDto, @Param('clusterId') clusterId: number): Promise <AdmissionReviewReplyDto> {
    console.log(`.....................................Validating webhook request for cluster ${clusterId} started at ${new Date().toUTCString()}.....................................`);
    const parsedRequest = plainToInstance(AdmissionReviewDto, request.body);
    let response: AdmissionReviewReplyDto;
    this.prometheusService.webhookApiCalled.inc();

    try {
      response = await this.clusterValidationService.validateRequest(clusterId, parsedRequest);
      this.prometheusService.podsAllowed.inc();
    } catch (e) {
      this.prometheusService.podsDenied.inc();
      // failed to validate response = do we default to allowing or dis-allowing?
      this.logger.error(e);
      response = new AdmissionReviewReplyDto();

      response.apiVersion = parsedRequest.apiVersion;
      response.kind = parsedRequest.kind;
      response.response.uid = parsedRequest.request.uid;

      response.response.allowed = await this.configService.get('admissionController.defaultAction') === 'allow';

      if (!response.response.allowed) {
        response.response.status = new AdmissionReviewReplyResponseStatus();
        response.response.status.message = "m9sweeper encountered an error while attempting to validate this deployment. If you would like to set m9sweeper " +
          "to not reject images when an internal error occurs, please set the ADMISSION_CONTROLLER_DEFAULT_ACTION environment variable to allow.";

        await this.clusterEventService.createK8sClusterEvent('ImageBlocked', 'Warning', 'Pod',
            `${request.body.request.name}`,
            `${request.body.request.name} in ${request.body.request.namespace} failed to pass validation and was blocked.`,
            clusterId, `${request.body.request.namespace}`);
        const clusterEventObject = this.clusterEventService.createClusterEventObject(0, 'Cluster Validation', 'Create', 'Error', `${request.body.request.name} in ${request.body.request.namespace} failed to pass validation and was blocked.`, request.body.request.namespace);
        await this.clusterEventService.createClusterEvent(clusterEventObject, clusterId);
      }
    }
    console.log(`.....................................Validating webhook request for cluster ${clusterId} ended at ${new Date().toUTCString()}.....................................`);
    return response;
  }
}
