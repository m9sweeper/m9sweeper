---
categories: ["Getting Started"]
tags: ["advanced", "installation", "tutorial"]
title: "Advanced Install"
linkTitle: "Advanced Install"
date: 2017-01-05
weight: 3
description: >
  Full list of installation options using m9sweeper's helm chart.
---

## Install

### Installation

We recommend putting your configuration in a values.yaml file and then deploying our app using helm. This
example uses "helm upgrade --install", which is an idempotent way of installing and/or upgrading the app. This
is repeatable and the same command can be run regardless of whether you intend to upgrade or install the app.

    helm repo add m9sweeper https://m9sweeper.github.io/m9sweeper && \
    helm repo update && \
    helm upgrade m9sweeper m9sweeper/m9sweeper --install --wait --create-namespace --namespace m9sweeper-system \
      --values values.yaml --version latest

When implementing for our customers we automate this in a CICD pipeline. Upgrades can be done simply by changing
which chart version you are deploying. By default, it installs the latest version, but you can add
--version to install a specific version of m9sweeper.

**At a minimum, you MUST specify these 4 values:**

    --set-string dash.init.superAdminEmail="super.admin@m9sweeper.io"
    --set-string dash.init.superAdminPassword="password"
    --set-string global.jwtSecret="changeme" \
    --set-string global.apiKey="YOUR-API-KEY"

## Validating Webhook

If you wish to have m9sweeper prevent applications from booting up that are not compliant with your specified
policies, you will need the validating webhook. This installs automatically and should work without any configuration.

However, **if you are running in Azure Kubernetes Service** OR have the kubernetes api firewalled in such a way that it
cannot reach out to a remote url for the validating webhook, then you will need to
[setup an nginx reverse proxy](https://github.com/m9sweeper/m9sweeper/blob/main/dash/backend/scripts/proxy-webhook/README.md)
using our reverse proxy self-installer. This script will generate a CA Certificate Bundle and Nginx configuration
to enable the reverse proxy to work in Azure Kubernetes Service.

## Falco bulkhead Deployment

Depending on your environment, Falco can send an immense amount of alerts to M9sweeper. This could overload the application
and cause it to crash. To avoid this, there is an option to deploy multiple instances of M9sweeper that only take api requests sent to /api/falco.

```yaml
falco:
  bulkhead: true
  replicas: 1
```

When set to true, this will create a seperate deployment appended with "-falco", a service, and when applicable, a service monitor.
This also edits ingress, routing all API calls from Falco, into the bulkhead deployment.


## Configuration Options

If postgresql is enabled, then it will deploy postgres db. Set to false to use an external postgres DB
```yaml
postgres:
  enabled: true
```

If rabbitmq is enabled, then it will deploy rabbitmq. Set to false to use an external rabbitmq.
```yaml
rabbitmq:
  enabled: true
```

The following table lists the configurable parameters of the chart and the default values.


| Parameter                                                                   | Description                                                                                                        | Default                         |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------| ------------------------------- |
| **postgresql properties**                                                   |
|
| `global.postgres.host`                                                      | postgresql hostname                                                                                                | `minesweeper-postgres`          |
| `global.postgres.username`                                                  | postgresql username                                                                                                | `postgres`                      |
| `global.postgres.password`                                                  | postgresql password                                                                                                | `postgres`                      |
| `global.postgres.database`                                                  | postgresql database                                                                                                | `postgres`                      |
| `global.postgres.port`                                                      | postgresql port                                                                                                    | `5432`                          |
|
| **rabbitmq properties**
|
| `global.rabbitmq.host`                                                      | rabbitmq hostname                                                                                                  | `minesweeper-rabbitmq`          |
| `global.rabbitmq.port`                                                      | rabbitmq port                                                                                                      | `5672`                          |
| `global.rabbitmq.username`                                                  | rabbitmq username                                                                                                  | `guest`                         |
| `global.rabbitmq.password`                                                  | rabbitmq password                                                                                                  | `guest`                         |
| `global.rabbitmq.queueName`                                                 | rabbitmq queue name                                                                                                | `trawler_queue`                 |
| `global.jwtSecret`                                                          | Provide a secret string that will be used to sign JWT tokens                                                       | `asdfasdfasd`                   |
| `global.baseUrl`                                                            | URL will be used in email templates to reference a http link to Dash                                               | `localhost:3000`                |
| `global.apiKey`                                                             | Provide a secret string that will be the default api key used for integrations                                          | `1234567890`                    |
| `global.trawlerApiKey`                                                             | Provide a secret string that will be the default api key for trawler                                          | `1234567890`                    |
| `global.kubeBenchApiKey`                                                             | Provide a secret string that will be the default kube bench api key                                          | `1234567890`                    |
| `global.kubeHunterApiKey`                                                             | Provide a secret string that will be the default kube hunter api key                                          | `1234567890`                    |
| `global.falcoApiKey`                                                             | Provide a secret string that will be the default falco API key                                          | `1234567890`                    |
|
| **Dash Properties**                                                          |
|
| `dash.image.registry`                                                       | Registry for Dash Helm chart                                                                                       | `dockerhub.io`                  |
| `dash.image.repository`                                                     | Repository for Dash Helm chart                                                                                     | `m9sweeper/dash`                |
| `dash.image.tag`                                                            | Tag for Dash Helm chart                                                                                            | `latest`                        |
|
| **values that will be used to initialize the Dash database during installation**
|
| `dash.init.clusterGroupName`                                                | Dash Init clusterGroupName                                                                                         | `default-cluster-group`         |
| `dash.init.clusterName`                                                     | Dash Init clusterName                                                                                              | `default-cluster`               |
| `dash.init.superAdminEmail`                                                 | Dash Init superAdminEmail                                                                                          | `admin@test.com`                |
| `dash.init.superAdminPassword`                                              | Dash Init superAdminPassword                                                                                       | `superadmin4me`                 |
| `dash.init.licenseKey`                                                      | Dash Init licenseKey for permission to run project                                                                 | ``                   |
| `dash.init.instanceKey`                                                     | Dash Init instanceKey for permission to run project                                                                | ``                   |
| `dash.init.docker.registries.name`                                          | Dash Init Registry Name                                                                                            | ``             |
| `dash.init.docker.registries.hostname`                                      | Dash Init Registry Hostname                                                                                        | ``        |
| `dash.init.docker.registries.login_required`                                | Dash Init login_required                                                                                           | ``                          |
| `dash.init.docker.registries.username`                                      | Dash Init Registry Username                                                                                        | ``                           |
| `dash.init.docker.registries.password`                                      | Dash Init password                                                                                                 | ``                        |
| **Trawler Configuration**                                                   |
| `trawler.image.registry`                                                    | Registry for Trawler Helm chart                                                                                    | `dockerhub.io`                  |
| `trawler.image.repository`                                                  | Repository for Trawler Helm chart                                                                                  | `m9sweeper/trawler`             |
| `trawler.image.tag`                                                         | Tag for Trawler Helm chart                                                                                         | `latest`                        |
|
| **Dash Email Properties**                                                   |
|
| `dash.email.method`                                                         | Email method options are SMTP or SENDGRID                                                                          | `SMTP`                            |
| `dash.email.smtp.host`                                                      | Choose smtp host                                                                                                   | `localhost`                     |
| `dash.email.smtp.port`                                                      | Choose smtp port                                                                                                   | `465`                           |
| `dash.email.smtp.tlsRequired`                                               | Choose smtp tls authentication required or not                                                                     | `true`                    |
| `dash.email.smtp.user`                                                      | Choose smtp username                                                                                               | `smtp`                          |
| `dash.email.smtp.password`                                                  | Choose smtp password                                                                                               | `smtp`                          |
| `dash.email.sendgridApiKey`                                                 | Choose email sendgridApiKey                                                                                        | ''                       |
| `dash.email.senderEmail`                                                    | Choose email senderEmail                                                                                           | ``           |
| `dash.email.enableSystemErrorEmail`                                         | Enable/disable system error email notifications                                                                    | `false`                 |
| `dash.email.systemErrorMailTo`                                              | The email address to send system error emails to                                                                   | ``           |
|
| **Dash Ingress Properties**                                                 |
|
| `dash.ingress.hosts`                                                        | Add lists of hosts                                                                                                | ``                  |
| `dash.ingress.path`                                                         | Add backend endpoint path                                                                                         | `/`                              |
| `dash.ingress.k8sIngress.enabled`                                           | Set true to enable nginx ingress                                                                                  | `false`                  |
| `dash.ingress.k8sIngress.annotations`                                       | Add annotations for nginx ingress                                                                                 | `kubernetes.io/ingress.class: nginx`                          |
| `dash.ingress.k8sIngress.tls.secretName`                                    | K8s secret where certificate is stored                                                                | `tls-secret`                     |
| `dash.ingress.k8sIngress.tls.hosts`                                         | Write hostname for apply tls                                                                                      | ``                  |
| **Istio Config - VirtualService, DestinationRule, Gateway (optional), PeerAuthentication (optional)**
| `dash.ingress.istio.enabled`                                                | Set true to enable Istio or false to disable                                                                      | `false`                  |
| `dash.ingress.istio.gateways.create`                                        | Set true to enable create istio gateways                                                                          | `false`                  |
| `dash.ingress.istio.gateways.gatewayRefs`                                   | Provide name to create istio gateway                                                                              | `istio-system/example`           |
| `dash.ingress.istio.loadBalancerType`                                       | Write name of loadBalancerType                                                                                    | `ROUND_ROBIN`                    |
| `dash.ingress.istio.mtlsMode`                                               | Set mtls mode, options are: PERMISSIVE or STRICT                                                                  | `PERMISSIVE`                     |
