# Setup Validating Webhook Proxy

In some installations of Kubernetes such as Azure Kubernetes Services (AKS) and Google Kubernetes Engine (GKE) as well as some others depending upon configuration, the kubernetes' API is not allowed to reach out to a remote cluster or
a remote ingress when validating whether a pod is allowed to boot or not. Therefore, we have to set it up to connect to a pod in the local cluster as well as setup the appropriate Certificate Authority, Public, and Private Keys to enable SSL.
This will allow the validating webhook to be hit by the Kubernetes API when validating whether a pod is compliant and allowed to boot up.

The auto-setup.sh script is an easy way to get a reverse proxy running in a nginx pod as well as setting up the validating webhook with reasonable defaults.



## How to run

Prerequisites:

 - This assumes you have kubectl and bash/zsh setup locally
 - This assumes you have m9sweeper installed (the script defaults to the m9sweeper-system namespace but can be changed with option flags)
 - This assumes you have cloned or downloaded the m9sweeper repository and you have a terminal open to this folder.

1. Change the permission of the auto-setup.sh file:

    `chmod +x auto-setup.sh`

    And then run:

    `./auto-setup.sh -n NAMESPACE -u M9SWEEPER_URL -c CLUSTERID`

2. Setup will continue, and if there are no errors the proxy will be up and running.
## NOTE:
* You can run the command as ./auto-setup.sh without the options for a default installation.
* You can run ./auto-setup.sh -h for a breif help line.
* -n should be the same namespace m9sweeper is installed into. The default is m9sweeper-system
* -u takes the BASE URL that the reverse proxy should direct to (e.g Example: https://m9sweeper.yourdomain.com) the default is for a local cluster install at http://m9sweeper-dash.m9sweeper-system.svc.cluster.local:3000
* -c this is the clusterID of your cluster. The default is 1



## Overview:

1. The initalize_proxy.yaml is applied to the cluster using kubectl. This creates a ServiceAccount, ClusterRole, ClusterRolebinding, and Deployment.
    These resources are needed to gain the access necessary for creating the reverse proxy resources.
2. Deletes the existing m9sweeper-webhook validating webhook configuration.
3. Then, we copy the reverse_proxy_setup.sh script and openssl.cnf files into the new *m9sweeper-proxy* pod and executes the reverse_proxy_setup.sh. The script creates the certificates, reverse proxy deployment, service, and validating webhook.
4. Deletes the initalize_proxy.yaml resources.



### reverse_proxy_setup.sh script
This script does most of the grunt work. Here is a summary:

* Parses inputs for the nginx config.
* This creates four kubernetes resources:


1. A secret named "m9sweeper-proxy-secrets" that is to be mounted as files in the reverse proxy.
2. A owasp/modsecurity:nginx-alpine deployment named "m9sweeper-reverse-proxy" (The reverse proxy). With all configuration passed as ENV variables.
3. A service named "m9sweeper-proxy" to access the pod.
4. A ValidatingWebhookConfiguration with the CA bundle created, and the path to the cluster specified.
