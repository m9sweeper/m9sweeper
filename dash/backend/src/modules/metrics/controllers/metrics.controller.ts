import {
  Body,
  Controller,
  Get, Post, Res,
  UseInterceptors
} from "@nestjs/common";
import { Response } from "express";
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import * as client from "prom-client";
import { PrometheusV1Service } from '../services/prometheus-v1.service';
import { PrometheusEnvironmentMetricsService } from '../services/prometheus-environment-metrics.service';

@ApiTags('Metrics')
@Controller()
export class MetricsController {
  constructor(
    private prometheusEnvService: PrometheusEnvironmentMetricsService
  ) {}

  @Get('/environment')
  async index(@Res() response: Response) {
    response.header("Content-Type", client.register.contentType);
    response.send(await this.prometheusEnvService.environmentMetrics());
  }

}
