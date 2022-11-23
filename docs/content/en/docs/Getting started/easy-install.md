---
categories: ["Getting Started", "tutorials"]
tags: ["installation", "getting started"]
title: "Easy Install"
linkTitle: "Easy Install"
date: 2017-01-05
weight: 2
description: >
  Install m9sweeper with a one-liner. 
---

You can install m9sweeper [using our helm chart](https://github.com/m9sweeper/charts). This 
is a one-line cli command that installs m9sweeper. Change the default username/password to your
own username/password and the API Key to something random/unpredictable. 

    helm repo add m9sweeper https://helm.m9sweeper.io/chartrepo/m9sweeper && \
    helm repo update && \
    helm upgrade m9sweeper m9sweeper/m9sweeper --install --wait --create-namespace --namespace m9sweeper-system \
      --set-string dash.init.superAdminEmail="super.admin@m9sweeper.io" \
      --set-string dash.init.superAdminPassword="password" \
      --set-string global.jwtSecret="changeme" \
      --set-string global.apiKey="YOUR-API-KEY"

Many more options are available. For serious enterprise deployments, we recommend creating a helm
values.yaml file and versioning this in a code repository to make upgrades easier. 

For more information, see the [advanced install guide](../advanced-install).
