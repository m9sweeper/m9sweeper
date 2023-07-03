import {makeCounterProvider} from '@willsoto/nestjs-prometheus';

export const prometheusCounters = [
  makeCounterProvider({
    name: 'dash_num_of_requests',
    help: 'Number of requests made',
    labelNames: ['method']
  }),
  makeCounterProvider({
    name: 'dash_cluster_created',
    help: 'Number of clusters Created'
  }),
  makeCounterProvider({
    name: 'dash_user_created',
    help: 'Number of Users Created'
  }),
  makeCounterProvider({
    name: 'dash_webhook_api_called',
    help: 'Number of calls made to Webhook Api'
  }),
  makeCounterProvider({
    name: 'dash_pods_allowed',
    help: 'Number of Pods allowed by Webhook'
  }),
  makeCounterProvider({
    name: 'dash_pods_denied',
    help: 'Number of Pods denied by Webhook'
  }),
  makeCounterProvider({
    name: "dash_login_counter",
    help: "Number of logins",
  }),
]
