# m9sweeper

Kubernetes Security for Everyone!

m9sweeper is a free and easy kubernetes security platform. It integrates industry standard open source utilities into a one-stop-shop kubernetes security tool.

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

