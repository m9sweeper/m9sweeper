# m9sweeper

Kubernetes Security for Everyone!

## Set Up RabbitMQ
1. In your .env file:
    RABBITMQ_HOST_NAME=localhost
    RABBITMQ_HOST_PORT=5672
    RABBITMQ_USER_NAME=guest
    RABBITMQ_USER_PASSWORD=guest
    RABBITMQ_PROTOCOL=amqp
    RABBITMQ_VHOST=/
    RABBITMQ_FRAMEMAX=
2. Get docker image from docker hub:
    `docker pull rabbitmq`
3. Start rabbitMQ container:
    `docker run -d --hostname my-rabbit --name some-rabbit rabbitmq`

## Run the Project Locally

### Start the API server:
* `cd dash/backend`
* `cp .env.sample .env`
  - open `.env` and find the list of DATABASE_... env vars.
  - update `DATABASE_CONNECTION_DATABASE`, `DATABASE_CONNECTION_USERNAME`, and
    `DATABASE_CONNECTION_PASSWORD` so they match your local postgres configuration
* `npm install`
* `npm run prebuild`
* `Until we figure out a CLI command, to make your first user, go into the users table in your
  database and set the first and last names, email, fill source_system_id and source_system_user_id with 0,
  and set your source_system_type to LOCAL_AUTH. Next, go into the user_authorities table and fill in the user_id
  column with your user_id and set authority_id to 1.`
* `npm run start`

## Setting Up First User
### In your .env file:
   SUPER_ADMIN_EMAIL=email@m9sweeper.io
   SUPER_ADMIN_PASSWORD=password
   TRAWLER_API_KEY=123456
* `cd dash/backend`
* `npm run build:local`
* `npm run cli users:init`

### Start the Frontend:
* `cd dash/frontend`
* `npm install`
* `npm start`

The browser should automatically open http://localhost:4200/
If it doesn't, navigate there yourself.

###Login:
* `Click on the link for forgot password. Set your password there and login.`


### Set Up local kubernetes cluster
Required: Docker desktop, kubectl
* In docker desktop preferences -> Kubernetes, check 'Enable Kubernetes' and click Apply & Restart
* In the terminal verify your new context availability: `kubectl config get-contexts`
* Change your context: `kubectl config use-context docker-desktop`
* Locate the new kube config file (hidden) in Mac Finder: navigate to your user folder, cmd + shift + . to display hidden folders, then copy the config file from the .kube folder into an accessible location, eg your Documents folder
* Log-in to Dash and 'Add Cluster': Select the above as your kubeconfig file in step one. Select 'docker-desktop' as your context in step two. The rest is history.

## CLI commands for cronjob
Before running cronjob, you must create a cluster. While creating a cluster, you must choose a kubeconfig file from your local machine. After creating the cluster, you will get a cluster id. After that, open terminal and go to dash/backend

- <code>cd dash/backend</code>

- To get the list of namespaces, deployments, images and pods from all cluster, run the below command in the terminal:
    <code>npm run cli cluster:sync all</code>

- To get the list of namespaces, deployments, images and pods from a specific cluster, run the below command in the terminal:
    <code>npm run cli cluster:sync <clusterId></code>

- To get the kubernetes contents history, run the below command in the terminal:
    <code>npm run cli populate:kubernetes-history</code>
