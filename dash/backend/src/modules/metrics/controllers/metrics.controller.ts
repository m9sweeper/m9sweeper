import {
  Body,
  Controller,
  Get, Post, Res,
  UseInterceptors
} from "@nestjs/common";
import { Response } from "express";
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import * as client from "prom-client";
import { PrometheusService } from "../services/prometheus.service";

@ApiTags('Metrics')
@Controller()
export class MetricsController {
  constructor(
    private prometheusService: PrometheusService
  ) {}

  @Get('/environment')
  index(@Res() response: Response) {
    response.header("Content-Type", client.register.contentType);
    response.send(this.prometheusService.environmentMetrics());
  }

}
