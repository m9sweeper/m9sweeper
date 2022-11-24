# m9sweeper

Kubernetes Security for Everyone!

m9sweeper is a free and easy kubernetes security platform. It integrates industry standard open source utilities into a one-stop-shop kubernetes security tool
that can walk most kubernetes adminstrators through securing a kubernetes
cluster as well as the apps running on the cluster.

# Features

m9sweeper makes securing a cluster easy with: 

 - CVE Scanning
 - Enforcement of CVE Scanning Rules
 - Reports and Dashboards, including historical reporting to see how your security posture has changed over time
 - CIS Security Benchmarking
 - Pen Testing
 - Deployment Coaching
 - Intrusion Detection
 - Gatekeeper Policy Management

# Toolbox

m9sweeper makes it easy to orchestrate the implementation of a number of free security tools:

[Trivy](https://github.com/aquasecurity/trivy): CVE Scanner

[Kubesec](https://github.com/controlplaneio/kubesec): Deployment Best Practices

[Kube Bench](https://github.com/aquasecurity/kube-bench): CIS Benchmarks

[OPA Gatekeeper](https://github.com/open-policy-agent/gatekeeper): Compliance and Security Policies

[Kube Hunter](https://github.com/aquasecurity/kube-hunter): Cluster Penetration Testing

[Project Falco](https://falco.org/): Intrusion Detection

# Quick Install

While our documentation has more details, installing m9sweeper can be as simple
as running a few CLI commands to install it into your own kubernetes cluster 
with helm. 

    helm repo add m9sweeper https://helm.m9sweeper.io/chartrepo/m9sweeper && \
    helm repo update && \
    helm upgrade m9sweeper m9sweeper/m9sweeper --install --wait \
      --create-namespace --namespace m9sweeper-system \
      --set-string dash.init.superAdminEmail="super.admin@m9sweeper.io" \
      --set-string dash.init.superAdminPassword="password" \
      --set-string global.jwtSecret="changeme" \
      --set-string global.apiKey="YOUR-API-KEY"

## Docs

All documentation can be found on [m9sweeper.io](https://m9sweeper.io/docs/latest/docs/)

