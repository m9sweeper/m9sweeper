---
title: "Installing Webhook"
linkTitle: "Installing Webhook"
weight: 2
description: >
  Installing the Webhook
---

In order to have m9sweeper enforce image scanning compliance in your cluster, you need to install a validating webhook
in your cluster. This should be done automatically by m9sweeper during the setup process, but if for some reason it
was not you can click "Update Kubeconfig" on your cluster's settings page and run through the setup wizard again
to have it install the webhook for you.

![../img_1.png](../img_1.png)

{{% alert title="Note on the Webhook" color="primary" %}}
If you are installing this on Azure Kubernetes Services (AKS) or Google Kubernetes Engine (GKE) or any other installation where the kubernetes API is blocked from reaching
out to external URL for things such as Validating Webhooks, please see the section reguarding Validating Webhook installations in the [advanced installation guide](../advanced-install).
{{% /alert %}}