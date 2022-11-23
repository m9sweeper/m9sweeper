---
title: "Falco"
linkTitle: "Falco"
weight: 11
description: >
  How to install and use Project Falco with M9sweeper to perform runtime security.
---

## What is Falco?
The Falco Project is an open source runtime security tool originally built by [Sysdig, Inc](https://sysdig.com/).

## What does Falco do? 
Falco uses system calls to secure and monitor a system, by:

- Parsing the Linux system calls from the kernel at runtime
- Asserting the stream against a powerful rules engine
- Alerting when a rule is violated

For more information, see the [Falco Documentation](https://falco.org/docs/).

## Setup and configuration

M9sweeper consumes HTTP requests from Falco in JSON format to present readable information in our UI.
### Deploy Falco

##### Add the Helm Chart Repo and install Falco:

    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    helm install falco falcosecurity/falco \
      --namespace falco --create-namespace \
      --set falco.driver.enabled=true \
      --set-string falco.driver.kind=ebpf \
      --set falco.tty=true \
      --set falco.json_output=true \
      --set falco.http_output.enabled=true \
      --set-string falco.http_output.url=https://m9sweeper.domain.com/api/falco/CLUSTER_ID/create

NOTE: Make sure to change the URL value to point to your M9sweeper instance as well as enter the CLUSTER_ID of whatever cluster it is supposed to save to.

We recommend using the EBPF driver, however, if you have issues please refer to to the [installation page](https://falco.org/docs/getting-started/installation/#install-driver). Or you may try to use the kernel driver and set "falco.driver.kind=module" above.

## Falco TLS error

 As of this writing, outputting alerts to an endpoint with TLS enabled cannot succeed:

[http_output not working, libcurl error: Problem with the SSL CA cert (path? access rights?) #2274](https://github.com/falcosecurity/falco/issues/2274)

We can circumvent this issue by implemeting a reverse proxy to forward traffic into M9sweeper. 

### Create a reverse proxy

Create a file named *falco_reverse_proxy.yaml* and copy the following contents:

> falco_reverse_proxy.yaml

    apiVersion: v1
    kind: ConfigMap
    metadata:
    name: nginx-conf
    namespace: falco
    data:
    nginx.conf: |
        server {
            listen       80;
            listen  [::]:80;
            server_name  localhost;

            location / {
                proxy_pass http://m9sweeper.yourdomain.com;
            }
        }
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: falco-reverse-proxy
    namespace: falco
    labels:
        app: falco-reverse-proxy
    spec:
    replicas: 1
    selector:
        matchLabels:
        app: falco-reverse-proxy
    template:
        metadata:
        labels:
            app: falco-reverse-proxy
        spec:
        containers:
        - name: falco-reverse-proxy
            image: nginx:alpine
            volumeMounts:
            - mountPath: /etc/nginx/conf.d # mount nginx-conf volumn to /etc/nginx/conf.d
            readOnly: true
            name: nginx-conf
        volumes:
        - name: nginx-conf
            configMap:
            name: nginx-conf # place ConfigMap `nginx-conf` on /etc/nginx/conf.d/default.conf
            items:
                - key: nginx.conf
                path: default.conf
    ---
    kind: Service
    apiVersion: v1
    metadata:
    name: falco-reverse-proxy
    namespace: falco
    spec:
    ports:
        - name: http
        port: 80
        targetPort: 80
    selector:
        app: falco-reverse-proxy
    type: ClusterIP

This file will create three Kubernetes resources in the falco namespace:
1. A configmap *nginx-conf*: 
    - This will store the Nginx reverse proxy configuration. (You will need to edit the proxy_pass field to point to your m9sweeper instance)

2. A deployment *falco-reverse-proxy*: 
    - This deployment will create a pod using the nginx:alpine image. This will be configured by the configmap *nginx-conf*

3. A service *falco-reverse-proxy* listening on port 80.


##### Apply *falco_reverse_proxy.yaml* to the cluster

    kubectl create -f falco_reverse_proxy.yaml

##### Change Falco's values.yaml 

You will need to change the http_output URL in the values.yaml configuration file for Falco. Or you can install/reinstall with helm command passing in the new https_output value.

> values.yaml

    http_output:
        url: "http://falco-reverse-proxy.falco.svc.cluster.local/api/falco/CLUSTER_ID/create"
