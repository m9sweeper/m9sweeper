---
title: "Managing Constraints"
linkTitle: "Managing Constraints"
weight: 4
description: >
  Using the M9sweeper Interface to Configure Gatekeeper
---

## Managing Constraint Templates

After installing Gatekeeper, your next step is to install constraint templates. You can do this using a CICD pipeline, 
or if you are new to this you can use the m9sweeper graphical user interface to install Constraint Templates from our
library of templates. 

First, open the Gatekeeper page for your cluster and click on "+Add More" in the top right. 

![../img.png](../img.png)

Then, check the boxes on the constraint templates you want to install and click save changes. 

![../img_1.png](../img_1.png)

After doing this, you will see the list of constraint templates has been installed. 

## Managing Constraints

Just installing constraint templates alone does not do anything - you also have to apply these constraint templates
to specific workloads / namespaces. This is done through the use of constraints. 

If you click on one of your constraint templates, you will be taken to a page that lists all of the constraints
created for this constraint template. After doing so, click "+Add More" to create a constraint for this template. 

![../img_2.png](../img_2.png)

In this user interface, it will let you set which namespaces and type of entity it applies to. Reasonable defaults
are typically filled in if you used one of our templates. 

![../img_3.png](../img_3.png)

If properties can be configured, we will automatically generate a user interface for configuring those properties. You
can fill in the required properties. 

![../img_4.png](../img_4.png)

Do not forget to select whether it is to be in enforcement mode or audit mode. Only enforcement mode is actually 
enforced - audit mode is purely used for evaluation purposes. 

![../img_5.png](../img_5.png)

Click save changes and now you should have your constraint created! 

![../img_6.png](../img_6.png)
