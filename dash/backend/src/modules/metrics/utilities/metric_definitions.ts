import { Provider } from '@nestjs/common';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

const basicMetrics: Provider<any>[] = [
  makeGaugeProvider({
    name: 'num_images_running',
    help: 'Number of images running',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_images_with_vulnerabilities',
    help: 'Number of running images with vulnerabilities',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_pods_compliant',
    help: 'Number of compliant pods',
    labelNames: ['namespace', 'cluster'],
  }),
  makeGaugeProvider({
    name: 'num_pods_noncompliant',
    help: 'Number of noncompliant pods',
    labelNames: ['namespace', 'cluster'],
  }),
  makeGaugeProvider({
    name: 'current_pod_compliance_percentage',
    help: 'Percentage of pods that are compliant',
    labelNames: ['namespace', 'cluster'],
  }),

  makeGaugeProvider({
    name: 'total_cves',
    help: 'Total number of CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_critical_cves',
    help: 'Number of critical CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_critical_cves',
    help: 'Number of critical CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_fixable_critical_cves',
    help: 'Number of fixable critical CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_major_cves',
    help: 'Number of major CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_fixable_major_cves',
    help: 'Number of fixable major CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_medium_cves',
    help: 'Number of medium CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_fixable_medium_cves',
    help: 'Number of fixable medium CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_low_cves',
    help: 'Number of low CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_fixable_low_cves',
    help: 'Number of fixable low CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_negligible_cves',
    help: 'Number of negligible CVEs in running images',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'num_fixable_negligible_cves',
    help: 'Number of fixable negligible CVEs in running images',
    labelNames: ['cluster'],
  }),
];

const kubeBenchMetrics: Provider<any>[] = [
  makeGaugeProvider({
    name: 'kube_bench_passed_tests',
    help: 'kube-bench most recent run: number of passed tests',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_bench_failed_tests',
    help: 'kube-bench most recent run: number of failed tests',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_bench_tests_with_warnings',
    help: 'kube-bench most recent run: number of tests with warnings',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_bench_tests_with_info_alerts',
    help: 'kube-bench most recent run: number of tests with info alerts',
    labelNames: ['cluster'],
  }),
];

const kubeHunterMetrics: Provider<any>[] = [
  makeGaugeProvider({
    name: 'kube_hunter_num_low_vulnerabilities',
    help: 'kube-hunter most recent run: number of low vulnerabilities',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_hunter_num_medium_vulnerabilities',
    help: 'kube-hunter most recent run: number of medium vulnerabilities',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_hunter_num_high_vulnerabilities',
    help: 'kube-hunter most recent run: number of critical vulnerabilities',
    labelNames: ['cluster'],
  }),
  makeGaugeProvider({
    name: 'kube_hunter_num_unknown_vulnerabilities',
    help: 'kube-hunter most recent run: number of unknown-severity vulnerabilities',
    labelNames: ['cluster'],
  }),
];

export const MetricDefinitions: Provider<any>[] = [].concat(basicMetrics, kubeBenchMetrics, kubeHunterMetrics);
