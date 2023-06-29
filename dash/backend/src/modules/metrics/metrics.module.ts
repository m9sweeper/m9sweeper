import {Global, Module} from '@nestjs/common';
import { prometheusCounters } from './utilities/prometheus_counters';
import { prometheusGauges } from './utilities/prometheus_gauges';
import { prometheusSummaries } from './utilities/prometheus_summaries';
import { PrometheusV1Service } from './services/prometheus-v1.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './controllers/metrics.controller';
import { MetricDefinitions } from './utilities/metric_definitions';
import { PrometheusEnvironmentMetricsService } from './services/prometheus-environment-metrics.service';

@Global()
@Module({
  controllers: [
    MetricsController,
  ],
  exports: [
    PrometheusEnvironmentMetricsService,
    PrometheusV1Service,
  ],
  imports: [],
  providers: [
    PrometheusEnvironmentMetricsService,
    PrometheusV1Service,
    ...prometheusCounters,
    ...prometheusGauges,
    ...prometheusSummaries,
    ...MetricDefinitions,
  ],
})
export class MetricsModule {}
