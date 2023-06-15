import { Injectable } from '@nestjs/common';
import {Counter, Gauge, Summary} from 'prom-client';
import {InjectMetric} from "@willsoto/nestjs-prometheus";
import * as client from "prom-client";

@Injectable()
export class PrometheusService {
    envMetricsCacheLength = 30 * 1000;  // 30s = 30,000ms
    envMetricsUpdatedTimestamp = Date.now();

    constructor(
      // @InjectMetric('dash_cluster_created') public clusterCreated: Counter<any>,
      // @InjectMetric('dash_user_created') public userCreated: Counter<any>,
      // @InjectMetric('dash_webhook_api_called') public webhookApiCalled: Counter<any>,
      // @InjectMetric('dash_pods_allowed') public podsAllowed: Counter<any>,
      // @InjectMetric('dash_pods_denied') public podsDenied: Counter<any>,
      // @InjectMetric('dash_num_of_unscanned_images') public numOfUnScannedImages: Gauge<any>,
      // @InjectMetric('dash_num_of_compliant_images') public numOfCompliantImages: Gauge<any>,
      // @InjectMetric('dash_num_of_non_compliant_images') public numOfNonCompliantImages: Gauge<any>,
      // @InjectMetric('dash_active_exceptions') public activeExceptions: Gauge<any>,
      // @InjectMetric('dash_expiring_exceptions_tomorrow') public expiringExceptionsTomorrow: Gauge<any>,
      // @InjectMetric('dash_active_exception') public activeException: Summary<any>,
      @InjectMetric('dash_num_of_requests') public numOfRequests: Counter<any>,
      @InjectMetric('dash_responses') public responses: Summary<any>,

      @InjectMetric('num_images_running') public numImagesRunning: Summary<string>,
      @InjectMetric('num_vulnerabilities_detected') public numVulnerabilitiesDetected: Gauge<string>,
      @InjectMetric('num_policy_violations') public numPolicyViolations: Gauge<string>,
    ) {}

    environmentMetrics() {
        if ((Date.now() - this.envMetricsCacheLength) > this.envMetricsUpdatedTimestamp) {
            this.updateEnvMetrics();
        }
        const envMetrics = [
          client.register.getSingleMetricAsString("dash_active_exceptions"),
          client.register.getSingleMetricAsString("dash_active_exception"),
          client.register.getSingleMetricAsString("dash_num_of_compliant_images"),
          client.register.getSingleMetricAsString("dash_num_of_non_compliant_images"),
        ]

        return envMetrics.join('\n\n');
    }

    private updateEnvMetrics() {
      const imagesRunningInNamespaces: any[] = [];
      for (const imagesInNamespace of imagesRunningInNamespaces) {
        this.numImagesRunning.labels(imagesInNamespace.namespace).observe(imagesInNamespace.num_images)
      }
        this.envMetricsUpdatedTimestamp = Date.now()
    }
}
