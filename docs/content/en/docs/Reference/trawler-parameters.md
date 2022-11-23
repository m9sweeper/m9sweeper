---
title: "Trawler Parameters"
linkTitle: "Trawler"
date: 2022-10-03
weight: 20
tags: ["docs", "trawler", "reference"]
description: >
  Instructions for Configuring Trawler
---

Trawler is our app for running scans of your containers. Right now, it is a wrapper around Trivy, one of the best
container scanners available, but it is architected such that other scanners could be supported in the future
(contributions are welcome!). 

## Functions

Trawler is normally run in **listening mode** in the cluster and in **scanning mode** when scanning a single image
from a CICD Pipeline. 

You can see how to use one mode or the other by just viewing the built-in help docs. 

    trawler help

The output looks something like this: 

    Usage:
    trawler [-Dh] [-A=<m9sweeperApiKey>] [-H=<rabbitmqHostname>]
    [-p=<rabbitmqPassword>] [-P=<trawlerParallelScanners>]
    [-q=<rabbitmqQueueName>] [-t=<rabbitmqPort>] [-u=<rabbitmqUsername>]
    [-U=<m9sweeperUrl>] [COMMAND]
    
    Description:
    Run Trawler in its RabbitMQ mode where it will monitor a specified RabbitMQ
    queue for scan jobs.
    
    Options:
    -P, --parallel-scans=<trawlerParallelScanners>
    number of scanners that Trawler can run at once
    -U, --url=<m9sweeperUrl>   URL of the m9sweeper instance
    -A, --api-key=<m9sweeperApiKey>
    API Key of the m9sweeper instance
    -D, --debug                whether to enable debug logs
    -u, --rabbitmq-user=<rabbitmqUsername>
    username of the RabbitMQ server
    -p, --rabbitmq-password=<rabbitmqPassword>
    password of the RabbitMQ server
    -H, --rabbitmq-host=<rabbitmqHostname>
    hostname of the RabbitMQ server
    -t, --rabbitmq-port=<rabbitmqPort>
    port of the RabbitMQ server
    -q, --rabbitmq-queue=<rabbitmqQueueName>
    name of the RabbitMQ queue to listen on
    -h, --help                 display this help and exit
    
    Commands:
    scan  Scan a single docker image in the standalone scan mode.

Many settings can be set through the CLI. 

Running an image scan is as simple as: 

    trawler scan alpine:3.15

## Environment Variables

In addition to CLI parameters, you can also configure Trawler using environment variables. This is the norm when
deploying a trawler runner to run automatic scans of new, unrecognized images as well as nightly image scans. 

#### General Configuration Options

| Parameter | Description | Default |
| -- | -- | -- |
| M9SWEEPER_URL | URL of m9sweeper API (required) | |
| M9SWEEPER_API_KEY | M9sweeper API Key | |
| TRAWLER_RUN_MODE | Whether to run as a passive scan worker (rabbitmq) or scan a single image and exit (scan) | rabbitmq |

#### Configuration Options for Running a Scan Worker

| Parameter | Description | Default |
| -- | -- | -- |
| TRAWLER_PARALLEL_SCANNERS | When passively listening for scans, how many parallel workers to run | 1 |
| RABBITMQ_USERNAME | RabbitMQ Username | guest |
| RABBITMQ_PASSWORD | RabbitMQ Password | guest | 
| RABBITMQ_HOSTNAME | RabbitMQ Hostname | rabbitmq |
| RABBITMQ_PORT | RabbitMQ Port Number | 5672 |
| RABBITMQ_QUEUE_NAME | RabbitMQ Queue Name to listen for Scans | trawler_queue | 

#### Configuration Options for Scanning a Single Image

| Parameter | Description | Default |
| -- | -- | -- |
| CLUSTER_NAME | Name of cluster to scan images for | |
| DOCKER_IMAGE_URL | Docker image url to scan | |
