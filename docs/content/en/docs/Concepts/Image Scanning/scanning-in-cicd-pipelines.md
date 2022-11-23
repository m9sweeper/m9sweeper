---
title: "Scanning in CICD Pipelines"
linkTitle: "Scanning in CICD Pipelines"
weight: 4
description: >
  Learn how to give developers feedback in your CICD pipelines. 
---

You can automatically scan images using trawler in your automated CICD pipelines. The easiest way to do this is by 
running trawler from the command line using the container image. It will look something like this. 

    docker run \
        --env "M9SWEEPER_URL=XXX" \
        --env "M9SWEEPER_API_KEY=XXX" \
        --env "CLUSTER_NAME=XXX" \
        --env "DOCKER_IMAGE_URL=XXX" \
        -it m9sweeper/trawler trawler scan

Note that you will need to provide an API key as well as the name of the cluster you are scanning it for 
so that it can authenticate with m9sweeper. You will have to run a scan for each cluster you plan to deploy it to because
each cluster might have different policies setup. 
