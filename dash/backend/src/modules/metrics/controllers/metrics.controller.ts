import {
  Body,
  Controller,
  Get, Post, Res,
  UseInterceptors
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import * as client from 'prom-client';
import { PrometheusEnvironmentMetricsService } from '../services/prometheus-environment-metrics.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Metrics')
@Controller()
export class MetricsController {
  constructor(
    private configService: ConfigService,
    private prometheusEnvService: PrometheusEnvironmentMetricsService,
  ) {}

  @Get('/environment')
  async index(@Res() response: Response) {
    const metricsConfig = await this.configService.get('metrics');
    if (this.configService.get('metrics.secureEndpoint')) {
      // validate authorization
    }
    response.header('Content-Type', client.register.contentType);
    response.send(await this.prometheusEnvService.environmentMetrics());
  }

}
