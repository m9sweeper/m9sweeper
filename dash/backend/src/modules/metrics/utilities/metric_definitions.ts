import { Provider } from "@nestjs/common";
import { makeGaugeProvider, makeSummaryProvider } from "@willsoto/nestjs-prometheus";

export const MetricDefinitions: Provider<any>[] = [
  makeSummaryProvider({
    name: 'num_images_running',
    help: 'Number of images running in the given cluster',
    labelNames: ['namespace']
  }),
  makeGaugeProvider({
    name: 'num_vulnerabilities_detected',
    help: 'Number of vulnerabilities in running images',
  }),
  makeGaugeProvider({
    name: 'num_policy_violations',
    help: 'Number of policy violations in running images',
  }),
];
