---
title: "Reviewing Exceptions"
linkTitle: "Reviewing Exceptions"
weight: 5
description: >
  M9sweeper extends Gatekeeper through the use of exceptions! 
---

While gatekeeper constraints can be scoped to specific namespaces or entity types, sometimes you want to create
temporary exceptions for a particular namespace that end at a specific date, or sometimes you want to just target
a specific workload. 

In those cases, you can use our exceptions feature. Our exceptions feature will automatically code-generate rego code
nightly, re-evaluating the exceptions every day and taking into account the exception's status, start date, and end
date. These exceptions work just like image compliance exceptions, except they target gatekeeper constraint templates
rather than image scanning rules. 

To use them, be sure and pick Gatekeeper as the exception type: 

![../img_7.png](../img_7.png)


