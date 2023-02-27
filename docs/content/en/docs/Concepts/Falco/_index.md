---
title: "Falco"
linkTitle: "Falco"
weight: 11
description: >
  How to install and use Project Falco with M9sweeper to perform runtime security.
---

## What is Falco?
The Falco Project is an open source runtime security tool originally built by [Sysdig, Inc](https://sysdig.com/).

## What does Falco do? 
Falco uses system calls to secure and monitor a system, by:

- Parsing the Linux system calls from the kernel at runtime
- Asserting the stream against a powerful rules engine
- Alerting when a rule is violated

For more information, see the [Falco Documentation](https://falco.org/docs/).

## Setup and configuration

M9sweeper consumes HTTP requests from Falco in JSON format to present readable information in our UI.

To accomplish this, [FalcoSideKick](https://github.com/falcosecurity/falcosidekick) is deployed to give us more control over Falco's output.
### Configuration Notes:
- Set the config.webhook.address value to your instance of M9sweeper. 
- Depending on how you are deploying M9sweeper, you might need to set config.webhook.checkcert=false.
- We recommend setting the minimum priority to "error". For more information see [Minimum Priority](#minimum-priority)

### Deploy Falco

##### Add the Helm Chart Repo then install Falco:

    helm repo add falcosecurity https://falcosecurity.github.io/charts
    helm repo update
    helm install falco falcosecurity/falco \
     --create-namespace \
     --namespace falco \
     --set falco.driver.enabled=true \
     --set-string falco.driver.kind=ebpf \
     --set falco.tty=true \
     --set falco.json_output=true \
     --set falco.json_include_output_property=true \
     --set falco.http_output.enabled=true \
     --set-string falco.http_output.url=http://falcosidekick:2801/ \
     --set falcosidekick.enabled=true \
     --set-string falcosidekick.config.webhook.address= 'https://M9SWEEPER/api/falco/CLUSTERID/create/?key=FALCO_API_KEY' \
     --set falcosidekick.config.webhook.checkcert=true \
     --set-string falcosidekick.config.webhook.minimumpriority='error'

### Notes: 
- Make sure to change the URL value to point to your M9sweeper instance as well as enter the CLUSTER_ID of whatever cluster it is supposed to save to.

- We recommend using the EBPF driver, however, if you have issues please refer to to the [installation page](https://falco.org/docs/getting-started/installation/#install-driver). Or you may try to use the kernel driver and set "falco.driver.kind=module" above.

### Anomaly Detection:
- Anomaly instrusion detection plays vital role in protecting networks against malicious activities.
- It detects unusual behaviors or threats in cloud-native environments with about 100 out-of-the-box security rules.
- Administrators can set up alert to receive email notification based on specific priority (severity) level(s) and email frequency that fits individual application needs.
- Simply go to Falco > Settings

#### Here is an example of Non-authorized container namespace change violation:
    rule: change_thread_namespace
    desc: an attempt to change a program/thread\'s namespace (commonly done as a part of creating a container) by calling setns.
    condition: syscall.type = setns and not proc.name in (docker, sysdig, dragent)
    output: "Namespace change (setns) by unexpected program (user=%user.name command=%proc.cmdline container=%container.id)"
    priority: WARNING

### Minimum Priority
  Falco Alerts can get very noisy. This option lets you choose which levels of alerts you want to include/exclude. Once set, all rules having a priority more severe than this level will be loaded/run. The default is an empty string and includes all alerts. The order is as follows:
  - Emergency
  - Alert
  - Critical
  - Error
  - Warning
  - Notice
  - Info
  - Debug

  For more information on Priority please refer to [Falco Docs - Priorities](https://falco.org/docs/rules/basic-elements/#priority)




