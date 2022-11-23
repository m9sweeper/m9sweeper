---
title: "Image Scanning"
linkTitle: "Image Scanning"
weight: 4
description: >
  Using Trivy to scan images for CVEs and other issues. 
---

[Trivy](https://github.com/aquasecurity/trivy) is one of the best tools for scanning Kubernetes images, and m9sweeper
can coordinate scanning images deployed to your cluster, rescanning of those images, as well as 
blocking images from deploying if they do not meet your minimum criteria for compliance. 

M9sweeper also allows you to create exceptions or have your employees' request exceptions be approved when they 
do not have the time to fix an issue in the moment but still want to allow applications to deploy. 

For a full list of trawler configuration options, see the [trawler reference guide](../../reference/trawler-parameters/)
