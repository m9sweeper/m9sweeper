# Running With Docker Compose
There are a lot of moving parts within M9sweeper that can make it diffcult to set up and configure on your computer.
That is why we have provided this Docker Compose file, which will allow you to run everything at once easily.

## Prerequisites
You will need to install Docker & Docker Compose. Dockers Docs has instructions for how to do that [here](https://docs.docker.com/compose/install/).

It is recommended to install Docker Desktop as a simple way to install both Docker and Docker Compose in addition to having a UI that will make certain tasks easier.

## Setting up
1. In the docker-compose directory, make a copy of .env.sample, and rename it to .env.sample
2. Update the values in your .env
   - at a minimum, fill in SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD, these will create the initial log in you use to sign into the UI with
   - If you wish to have email function, you will need to enter the details for your SMTP provider in the SMTP_EMAIL_XXX variables
   - You can update any other variables you'd like, refer to the documentation for the appropriate service for more details on them.

## Running
1. Navigate in you CLI to the docker-compose directory
2. Run `docker-compose build` to build all of the services. This will build these services
    - dash
    - trawler
    - go-crond (Used exclusively in docker compose to simulate Kubernetes Cronjobs)
3. Run `docker-compose up` to start all of the services
   - Note: Any changes you make in the code will not be reflected until you run `docker-compose build` again
4. Docker Compose will pull images for the other services, and then boot all of the services up.
   - The first time you do this, it will likely take a few minutes to pull all the images
   - For subsequent runs, it will generally only take a minute or two for all of the services to boot up.
5. The Dash ui will be available on [http://localhost:3000](http://localhost:3000)

## Services Run in Docker Compose File
These services will all be run and networked together by running this docker compose project.

### Postgres
Postgres is the database that M9sweeper uses. This docker compose file creates a volume that will beb called
docker-compose_m9sweeperDbData to persist your data.

### Rabbit MQ
This is used for the Dash API to push messages to in order to inform Trawler of images that need to be scanned.

### Dash
The dash project from this repo. It contains both the UI and API, that are the heart of the application.

### Trawler
This will be built from the trawler project in this repo.
It will read messages from Rabbit MQ in order to know which images it should run scans against,
and submit the results to dash.

### Dash-init
This is an extra instance of dash, that will run setup jobs. These jobs will only run once successfully,
and will exit quickly in future runs of the docker compose project

### Kubesec
A security analysis tool.
Dash will call on Kubesec to generate reports when a user requests those reports from the dash UI.

### go-crond
This is a crontab that will run the jobs that would be run as Kubernetes cronjobs when deployed with helm.