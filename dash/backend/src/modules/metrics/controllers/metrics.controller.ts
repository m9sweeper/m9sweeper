import {
  Controller,
  Get, Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import * as client from 'prom-client';
import { PrometheusEnvironmentMetricsService } from '../services/prometheus-environment-metrics.service';
import { MetricsGuard } from '../../../guards/metrics.guard';

@ApiTags('Metrics')
@Controller()
export class MetricsController {
  constructor(
    private prometheusEnvService: PrometheusEnvironmentMetricsService,
  ) {}

  @Get('/environment')
  @UseGuards(MetricsGuard)
  async index(@Res() response: Response) {
    response.header('Content-Type', client.register.contentType);
    response.send(await this.prometheusEnvService.environmentMetrics());
  }

}
