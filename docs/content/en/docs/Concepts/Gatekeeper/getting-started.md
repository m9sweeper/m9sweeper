---
title: "Getting Started"
linkTitle: "Getting Started"
weight: 2
description: >
  M9sweeper makes managing Gatekeeper constraints and constraint templates easy!
---

Gatekeeper is a great tool for creating rules for your Kubernetes cluster. You configure
rules using constraint templates and constraints.

Constraint templates, such as this, allow you to define rules using a language called Rego. 

    apiVersion: templates.gatekeeper.sh/v1beta1
    kind: ConstraintTemplate
    metadata:
      name: k8srequiredlabels
    spec:
      crd:
        spec:
          names:
            kind: K8sRequiredLabels
          validation:
            # Schema for the `parameters` field
            openAPIV3Schema:
              properties:
                labels:
                  type: array
                  items:
                    type: string
      targets:
        - target: admission.k8s.gatekeeper.sh
          rego: |
            package k8srequiredlabels
    
            violation[{"msg": msg, "details": {"missing_labels": missing}}] {
              provided := {label | input.review.object.metadata.labels[label]}
              required := {label | label := input.parameters.labels[_]}
              missing := required - provided
              count(missing) > 0
              msg := sprintf("you must provide labels: %v", [missing])
            }

Constraints are then created to apply these rules to a particular set of kubernetes entities. 
These constraints can also contain configuration parameters, such as which labels are required (in this example).

    apiVersion: constraints.gatekeeper.sh/v1beta1
    kind: K8sRequiredLabels
    metadata:
      name: ns-must-have-gk
    spec:
      match:
        kinds:
        - apiGroups: [""]
          kinds: ["Namespace"]
      parameters:
        labels: ["gatekeeper"]

M9sweeper makes managing your constraint templates and constraints extremely convenient through an easy-to-use user interface. 

To get started, you need to [install Gatekeeper](https://open-policy-agent.github.io/gatekeeper/website/docs/install/). 


[Read more about constraint templates](https://open-policy-agent.github.io/gatekeeper/website/docs/constrainttemplates/)
