---
title: "Reviewing Pod Compliance"
linkTitle: "Reviewing Pod Compliance"
weight: 6
description: >
  M9sweeper makes seeing a pod's Gatekeeper compliance extremely easy! 
---

To view a pod's compliance, navigate to your cluster's list of workloads. Then, click on the namespace you want to
review. 

![../img_8.png](../img_8.png)

Next, it will list all pods in the namespace. Note that it re-populates this list hourly.

![../img_9.png](../img_9.png)

If you click on a pod, it will list all images in the pod and those images' own compliance. 

![../img_10.png](../img_10.png)

If you click on the Gatekeeper icon in the top right, it will tell if you if any violations exist and, if so, what 
violations exist. 

![../img_11.png](../img_11.png)


