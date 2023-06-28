---
title: "Dash Parameters"
linkTitle: "Dash"
date: 2022-10-03
weight: 10
tags: ["docs", "dash", "reference"]
description: >
  Instructions for configuring dash. 
---

The most common way to configure dash is to simply configure environment variables. 
Some parameters are only used during the initial installation. 

For details about configuring environment variables for the dash app, see the [advanced install guide](../../getting-started/advanced-install). 

### Required Parameters

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| *SECURITY_JWT_SECRET* | JWT Secret for signing JWT Tokens (REQUIRED) | null |
| *DEFAULT_SUPER_ADMIN_EMAIL* | Default super admin email to create during installation | null |
| *DEFAULT_SUPER_ADMIN_PASSWORD* | Default super admin password to create during installation | null |

### Complete List of ENV Variables

#### Server Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| *DEFAULT_SUPER_ADMIN_EMAIL* | Default super admin email to create during installation | null |
| *DEFAULT_SUPER_ADMIN_PASSWORD* | Default super admin password to create during installation | null |
| *SECURITY_JWT_SECRET* | JWT Secret for signing JWT Tokens (REQUIRED) | null |
| SERVER_NAME | Server name (can largely ignore) | M9sweeper |
| SERVER_HOST | What network adapter to listen on (defaults to all - 0.0.0.0) | 0.0.0.0 |
| SERVER_PORT | What port to listen on | 3000 |
| SERVER_BASE_URL | Server Base URL for things like links in emails | http://localhost:3000/ |
| SERVER_FRONTEND_URL | Server Frontend URL for things like links in emails. Only needed if different that SERVER_BASE_URL | ${SERVER_BASE_URL} |

#### Database Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| DATABASE_CLIENT | Database client (do not change) | postgresql |
| DATABASE_CONNECTION_HOST | Database connection host | localhost |
| DATABASE_CONNECTION_PORT | Database connection port | 5432 |
| DATABASE_CONNECTION_DATABASE | Database name | postgres |
| DATABASE_CONNECTION_USERNAME | Database connection username | postgres |
| DATABASE_CONNECTION_PASSWORD | Datbase connection password | postgres |
| DATABASE_POOL_MIN | Database connection pool minimum connections | 1 |
| DATABASE_POOL_MAX | Database connection pool maximum connections | 5 |
| DATABASE_POOL_IDLETIMEOUT | Time before connections are reaped when inactive (in milliseconds) | 60000 |
| DATABASE_ACQUIRE_CONNECTION_TIMEOUT | How long to wait for database connections to be acquired before timing out (in milliseconds) | 20000 |
| DATABASE_MIGRATION_ENABLED | Whether to run db migrations (0 to disable) | true |
| DATABASE_MIGRATION_TABLE_NAME | What table name to use to store which db migrations have been run | migrations |
| DATABASE_MIGRATION_DIRECTORY | Where to look for db migration scripts (don't change) | ./migrations |
| DATABASE_SEED_ENABLED | Whether to seed data with the sample data (1 to enable) | off |
| DATABASE_SEED_DIRECTORY | Where to find db seed data | ./seeds |
| DATABASE_DEFAULT_SCHEMA | Database search path | public |

#### Email Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| EMAIL_CONFIG_USE | What email protocol to use (smtp is all that is supported) | SMTP |
| EMAIL_SMTP_HOST | SMPT Host (leave blank to disable) | |
| EMAIL_SMTP_PORT | SMTP Port Number | 465 |
| EMAIL_DEBUG | Whether or not to print out emails to console (set to 1 to enable) | off |
| EMAIL_SMTP_SECURE_CONNECTION | Whether SMTP is secured (set to 1 to enable) | off |
| EMAIL_SMTP_AUTH_USER | SMTP user | |
| EMAIL_SMTP_AUTH_PASSWORD | SMTP password | |
| EMAIL_DEFAULT_SENDER_EMAIL | Who emails should appear from |
| EMAIL_SYSTEM_ERROR_REPORT_ENABLE | Email errors to a system email address (1 to enable) | off |
| EMAIL_SYSTEM_ERROR_REPORT | Where to email system errors | |
| EMAIL_TEMPLATE_DIR | Email template directory (mount/provide your own to customize emails) | dist/email-templates |

#### RabbitMQ Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| RABBITMQ_ENABLED | Whether to enable rabbitmq (1 is enabled) | 1 - enabled |
| RABBITMQ_HOST_NAME | RabbitMQ Hostname |rabbitmq|
| RABBITMQ_HOST_PORT | RabbitMQ Port Number | 5672 |
| RABBITMQ_PROTOCOL | RabbitMQ Protocol (don't change) | amqp |
| RABBITMQ_USER_NAME | RabbitMQ Username | guest |
| RABBITMQ_USER_PASSWORD | RabbitMQ Password | guest |
| MSG_QUEUE_NAME_IMAGE_SCANNER | RabbitMQ Queue Name for queueing scans |trawler_queue|
| RABBITMQ_VHOST | RabbitMQ VHost | / |
| RABBITMQ_FRAMEMAX | RabbitMQ Framerate | 0 |

#### File Storage Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| FILE_MANAGEMENT_MAX_FILE_FILE | 
| FILE_MANAGEMENT_STORAGE | File storage method. local or s3 (see multer docs) | local | 
| FILE_MANAGEMENT_LOCAL_DEST | Where to store files | /mnt/storage |
| FILE_MANAGEMENT_S3_REGION | Amazon S3 Region | |
| FILE_MANAGEMENT_S3_ACCESS_KEY_ID | AWS Access Key ID | |
| FILE_MANAGEMENT_S3_ACCESS_KEY_SECRET | AWS Access Key Secret ||
| FILE_MANAGEMENT_S3_BUCKET_NAME | AWS S3 Bucket Name

#### Misc App Configuration

| Variable            | Description           | Default |
|-------------------|-------------------|------|
| ADMISSION_CONTROLLER_DEFAULT_ACTION | The default behavior when we fail to validate whether or not an image is compliant for some reason. | deny |
| GATEKEEPER_TEMPLATE_DIR | Where gatekeeper templates should be loaded from | dist/gatekeeper-templates |
| KUBEBENCH_CONFIG_DIR | Where to load the kubebench configuration templates | kube-bench-templates |
| RELEASE_NAMESPACE | Where it should install things when using install wizards | default |
