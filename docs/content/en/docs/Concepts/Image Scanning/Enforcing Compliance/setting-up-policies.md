---
title: "Setting Up Policies"
linkTitle: "Setting Up Policies"
weight: 1
description: >
  Define how much risk you are willing to tolerate. 
---

### Policy Settings

In the organization settings, you can click on policies in the left navigation and configure one or more policies
for your cluster. These policies define what criteria an image must meet to be considered compliant in the cluster. 

It looks something like this. 

![../img_2.png](../img_2.png)

Only policies and scanners that are active and required will be used in determing whether an image is compliant. Also,
when evaluating an image for a cluster, only policies that are configured for that cluster will be applied. 

### Configuring Trivy Requirements

When configuring the trivy scanner, you can define the maximum number of vulnerabilities for each category. The
defaults that come pre-installed essentially will block any image with a fixable major or critical vulnerability. 

![../img_3.png](../img_3.png)

