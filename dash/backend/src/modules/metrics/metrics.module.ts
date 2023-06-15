import {Global, Module} from '@nestjs/common';
import { prometheusCounters } from "./utilities/prometheus_counters";
import { prometheusGauges } from "./utilities/prometheus_gauges";
import { prometheusSummaries } from "./utilities/prometheus_summaries";
import { PrometheusService } from "./services/prometheus.service";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { MetricsController } from "./controllers/metrics.controller";
import { MetricDefinitions } from "./utilities/metric_definitions";

@Global()
@Module({
  controllers: [
    MetricsController,
  ],
  exports: [
    PrometheusService,
  ],
  imports: [],
  providers: [
    PrometheusService,
    ...prometheusCounters,
    ...prometheusGauges,
    ...prometheusSummaries,
    ...MetricDefinitions,
  ],
})
export class MetricsModule {}
