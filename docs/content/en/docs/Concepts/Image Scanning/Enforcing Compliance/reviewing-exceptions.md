---
title: "Exceptions"
linkTitle: "Exceptions"
weight: 4
description: "How to manage policy exceptions. "
---

Sometimes, for practical reasons, you may need to allow something with a known security issue to continue to be deployed
in an environment. You can do this using exceptions. 

## Creating Exceptions

Your team can create exceptions when the need arises. 

![../img_6.png](../img_6.png)

## Temporary Exceptions

When a new exception is discovered such as through a nightly image rescan, you may want automatically provide teams 
with a certain amount of time (lets say a week) before it would block their deployments. This can be done through the
use of a temporary exception. 

To enable this feature, you need to edit the policy that is setup for your cluster(s) and check the box (see below) and
set how many days the temporary exceptions should be active. 

![../img_5.png](../img_5.png)

When new temporary exceptions are created, it will email all of your admins to review and decide what to do. They should
notify your software development teams if the issue should be resolved right away and/or change the end date on the
exception. 

## Exception Statuses

**Active**: Active exceptions are the only exceptions that will be used when validating image compliance, and only
if the current date is within the exception's start and end date. 

**In Review**: When an exception is submitted for review, it will be in this status. It will not be used when validating
an image's compliance, but someone should review to decide whether it is a risk your organization is willing to take. 

**Inactive**: The exception will be ignored when validating image compliance. 

## Requesting Exceptions

When viewing an image, if a team member who is NOT an admin believes an exception is required, they can request an 
exception. This exception falls into the In Review status and will not be active, but it does provide a forum for
your team to request exceptions and for someone else (such as your security/ops team) to review and approve the 
exception. They would approve the exception by changing its status to Active. 

![../img_4.png](../img_4.png)

