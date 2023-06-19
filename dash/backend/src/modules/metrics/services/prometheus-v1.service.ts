import { Injectable } from '@nestjs/common';
import {Counter, Gauge, Summary} from 'prom-client';
import {InjectMetric} from "@willsoto/nestjs-prometheus";
import * as client from "prom-client";

@Injectable()
export class PrometheusV1Service {

    constructor(
      @InjectMetric('dash_cluster_created') public clusterCreated: Counter<any>,
      @InjectMetric('dash_user_created') public userCreated: Counter<any>,
      @InjectMetric('dash_webhook_api_called') public webhookApiCalled: Counter<any>,
      @InjectMetric('dash_pods_allowed') public podsAllowed: Counter<any>,
      @InjectMetric('dash_pods_denied') public podsDenied: Counter<any>,
      @InjectMetric('dash_num_of_unscanned_images') public numOfUnScannedImages: Gauge<any>,
      @InjectMetric('dash_num_of_compliant_images') public numOfCompliantImages: Gauge<any>,
      @InjectMetric('dash_num_of_non_compliant_images') public numOfNonCompliantImages: Gauge<any>,
      @InjectMetric('dash_active_exceptions') public activeExceptions: Gauge<any>,
      @InjectMetric('dash_expiring_exceptions_tomorrow') public expiringExceptionsTomorrow: Gauge<any>,
      @InjectMetric('dash_active_exception') public activeException: Summary<any>,
      @InjectMetric('dash_num_of_requests') public numOfRequests: Counter<any>,
      @InjectMetric('dash_responses') public responses: Summary<any>,
    ) {}

}
