# Trawler

Trawler is the component of m9sweeper in charge of scanning

## Local ENV Setup

1. Install GraalVM and Native Image

More at https://github.com/graalvm/homebrew-tap

    brew install --cask graalvm/tap/graalvm-ce-lts-java11

Then set java_home and path to match the version installed and install native-image.

    export JAVA_HOME=/Library/Java/JavaVirtualMachines/graalvm-ce-javaV-XX.Y.Z/Contents/Home
    export PATH=/Library/Java/JavaVirtualMachines/graalvm-ce-javaV-XX.Y.Z/Contents/Home/bin:"$PATH"
    gu install native-image

Then you can open the project with Intellij and compile like this:

    ./mvnw package

## Running CLI Commands

We use Pico CLI to provide a clean CLI interface. When you run trawler from the CLI
you will get a menu like the one below walking you through how to use it.

    Usage: trawler [-hV] [COMMAND]
    -h, --help      Show this help message and exit.
    -V, --version   Print version information and exit.
    Commands:
    scan    Scan docker image from command line
    listen  Scan docker image from RabbitMQ
    help    Displays help information about the specified command

## Running stand-alone in CICD Pipeline

We can point trawler at a specific image for a specific cluster using the trawler
scan command. The image name, cluster credentials, and other settings all need to be passed in
over the command line using options (see more details below).

    trawler scan

## Running listening to RabbitMQ topic for things to scan

We can run it in this way, having it triggered by m9sweeper's Dash project
to can things on-demand by reading from a RabbitMQ Queue.

    trawler

## Configuration Methods

1. CLI Options:

       --somevariable=somevalue
2. Local .env File
3. ENV Variables

| Purpose                                                                   | ENV variable              | Standalone mode CLI args | Listener mode CLI args    |
|---------------------------------------------------------------------------|---------------------------|--------------------------|---------------------------|
| The number of scanners trawler should be allowed to run at a single time. | TRAWLER_PARALLEL_SCANNERS | --parallel-scans         | --parallel-scans          |
| URL to access the m9sweeper dashboard on                                  | M9SWEEPER_URL             | -U or --url              | -U or --url               |
| API Key to use to login to the m9sweeper API                              | M9SWEEPER_API_KEY         | -A or --api-key          | -A or --api-key           |
| Cluster Name                                                              | CLUSTER_NAME              | -c or --cluster-name     | N/A                       |
| URL of docker image to scan                                               | DOCKER_IMAGE_URL          | -u or --image-url        | N/A                       |
| Username for the m9sweeper RabbitMQ                                       | RABBITMQ_USERNAME         | N/A                      | -u or --rabbitmq-user     |
| Password for the m9sweeper RabbitMQ                                       | RABBITMQ_PASSWORD         | N/A                      | -p or --rabbitmq-password |
| Hostname for the m9sweeper RabbitMQ server                                | RABBITMQ_HOSTNAME         | N/A                      | -H or --rabbitmq-host     |
| Port for the m9sweeper RabbitMQ server                                    | RABBITMQ_PORT             | N/A                      | -t or --rabbitmq-port     |
| Name of the RabbitMQ queue to listen on                                   | QUEUE_NAME                | N/A                      | -q or --rabbitmq-queue    |
| Debug                                                                     | DEBUG                     | -D or --debug            | -D or --debug             |
| Help                                                                      |                           | -h or --help             | -h or --help              |

Sample command:

 stand-alone mode:

 `trawler scan --url="https://dev-m9sweeper.ngrok.io" --api-key='APIKEYGOESHERE' --debug --parallel-scans=1 --cluster-name="default-cluster" --image-url="docker.io/alpine"`

  listening mode:

  `trawler --url="https://dev-m9sweeper.ngrok.io" --api-key='APIKEYGOESHERE' --debug --parallel-scans=1 --rabbitmq-user="admin" --rabbitmq-password="admin" --rabbitmq-host="localhost" --rabbitmq-port=5672 --rabbitmq-queue="trawler_queue"`
## Available config variables

See .env.sample for the complete list and description of each.

## Regenerating M9sweeper API Client

To generate the M9sweeper API client, update the swagger-spec.json and run this command:

    ./mvnw swagger-codegen:generate antrun:run@copy-swagger-api-client-src

To get an updated version of the swagger-spec.json, go to the url https://dev-m9sweeper.intelletive.com/trawler-doc-json and copy the provided JSON file

If running a local instance of dash, the JSON can be accessed at the backend port, by default localhost:3200/trawler-doc-json
