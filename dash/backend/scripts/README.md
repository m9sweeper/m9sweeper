# Setup Validating Webhook for AKS

Azure Kubernetes Services does not allow kubernetes' API to reach out to a remote cluster or remote ingress when validating whether a pod is allowed to boot or not. 
Therefore, we have to set it up to connect to a pod in the local cluster as well as setup the appropriate CA, Public, and Private Keys to enable SSL. Then the 
validating webhook can be hit by the Kubernetes API when validating whether a pod is compliant and allowed to boot up. 

The auto-setup.sh script is an easy way to get a reverse proxy running in a nginx pod as well as setting up the validating webhook with reasonable defaults. 



## How to run

Prerequisites: 

 - This assumes you have kubectl and bash/zsh setup locally
 - This assumes you have m9sweeper installed in the m9sweeper-system namespace
 - Delete the "m9sweeper-webhook" ValidatingWebhookConfiguration in your Kubernetes cluster

1. Change the permission of the auto-setup.sh file:
    
    `chmod +x auto-setup.sh`
    
    And then run:
    
    `./auto-setup.sh`
2. This will eventually prompt you to enter the URL for m9sweeper. If this is a remote instance, please enter in the full url (e.g https://M9SWEEPER.example.com).
    If this is a local instance, just press enter.
3. Then, you will be prompted to enter the cluster ID that is reflected in M9sweeper. The default is set to "1"
4. Setup will continue, and if there are no errors the proxy will be up and running.



## Overview:

1. The initalize_proxy.yaml is applied to the cluster using kubectl. This creates a ServiceAccount, ClusterRole, ClusterRolebinding, and Deployment.
    These resources are needed to gain the access necessary for creating the reverse proxy resources.
2. Then, we copy the reverse_proxy_setup.sh script into the new *m9sweeper-proxy* pod and execute it. The script creates the certificates, reverse proxy deployment/service, and validating webhook.



### reverse_proxy_setup.sh script
This script does most of the grunt work. Here is a summary:

* Parses inputs for the nginx config.
* This creates three kubernetes resources:


1. A secret named "m9sweeper-proxy-secrets" that is to be mounted as files in the reverse proxy.
2. A owasp/modsecurity:nginx-alpine deployment named "m9sweeper-reverse-proxy" (The reverse proxy). With all configuration passed as ENV variables.
3. A service named "m9sweeper-proxy" to access the pod.
4. A ValidatingWebhookConfiguration with the CA bundle created, and the path to the cluster specified.
