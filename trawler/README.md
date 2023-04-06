# Trawler

Trawler is the component of m9sweeper in charge of scanning images and providing that data back to m9sweeper. Trawler has two methods of being run, a standalone and a listener mode. In the standalone mode you can provide details about a single image you wish to have scanned. This is useful for usage in locations such as CICD pipelines or running on a local machine to check one image. In the listener mode Trawler is configured to listen to the RabitMQ server that m9sweeper will push jobs too and will then scan images as the jobs are provided.

<br>

## Configuration

The configuration that Trawler requires in order to be run can be provided in a number of different ways. Below they are listed in the order they are utilized upon startup. It is important to note that items further down in the list CAN override items set in config methods further up in the list. An example of this would be if you set the enviroment variable `M9SWEEPER_URL` to `https://dev-m9sweeper.ngrok.io` but then in the CLI arguments you set the `--api-key` to `https://m9sweeper.somedomain.com` then Trawler will utilize the `https://m9sweeper.somedomain.com` URL.



### Configuration Methods:

1. **Enviroment Variables:** You can configure all options of Trawler using enviroment variables configured within your system. This can make it simply to use in things like Docker containers where values might change often.
2. **Local `.env` file:** Trawler can also load its configuration using a standard env file containing a key/value list of enviroment variables. These variables are the same ones that are used in the above Enviroment Variables option.
3. **Command Line Interface Arguments (CLI args):** Finally, you can pass in configuration options to Trawler using CLI arguments. Trawler utilize the Pico CLI library in order to provide a clean and familiar method of running Trawler as a CLI application. See the below section on running Trawler to see example commands.



### Configuration Options:

| <u>**Enviroment Variable**</u> | **<u>Description</u>**                                       | **<u>Corresponding CLI Argument</u>**                        | **<u>Default Value</u>** |
| :----------------------------: | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------: |
|        TRAWLER_RUN_MODE        | Defines the mode that Trawler should run in. Possible options are as follows:<br />- `standalone`<br />- `rabbitmq` | Using the `scan` option is the same as setting the ENV variable to `standalone`. Otherwise it uses the default value. |        `rabbitmq`        |
|   TRAWLER_PARALLEL_SCANNERS    | This sets the number of scanners that Trawler is allowed to run at one time. This should be an INTEGER. | -P<br /><br />*or*<br /><br />--parallel-scans               |           `1`            |
|         M9SWEEPER_URL          | This is the full URL to your m9sweeper instance. If you are running m9sweeper on a non-standar port (80 for http or 443 for https) then you must include the port as well. | -U<br /><br />*or*<br /><br />--url                          |          `N/A`           |
|       M9SWEEPER_API_KEY        | This is the API token that Trawler will use to login to your m9sweeper instance. | -A<br /><br />*or*<br /><br />--api-key                      |          `N/A`           |
|       RABBITMQ_USERNAME        | ***Listener Mode Only:***<br />This is the username to your RabbitMQ server. | -u<br /><br />*or*<br /><br />--rabbitmq-user                |         `guest`          |
|       RABBITMQ_PASSWORD        | ***Listener Mode Only:***<br />This is the password to your RabbitMQ server. | -p<br /><br />*or*<br /><br />--rabbitmq-password            |         `guest`          |
|       RABBITMQ_HOSTNAME        | ***Listener Mode Only:***<br />This is the hostname or IP address of your RabbitMQ server. | -H<br /><br />*or*<br /><br />--rabbitmq-host                |        `rabbitmq`        |
|         RABBITMQ_PORT          | ***Listener Mode Only:***<br />This is the port that your RabbitMQ server is running on. | -t<br /><br />*or*<br /><br />--rabbitmq-port                |          `5672`          |
|      RABBITMQ_QUEUE_NAME       | ***Listener Mode Only:***<br />This is the name of the queue that Trawler will listen too for job information from m9sweeper. This must be set the same as in your m9sweeper configuration. | -q<br /><br />*or*<br /><br />--rabbitmq-queue               |     `trawler_queue`      |
|          CLUSTER_NAME          | ***STANDALONE MODE ONLY:***<br />This is the name of the cluster that Trawler will send the scan results back too in m9sweeper. This should match an existing cluster defined in m9sweeper. | -c<br /><br />*or*<br /><br />--cluster-name                 |          `N/A`           |
|        DOCKER_IMAGE_URL        | ***STANDALONE MODE ONLY:***<br />This is the full URL of the docker image you wish to scan. Make sure that you include the repository URL as well. For example, this following value would scan the base Alpine docker image:<br />`docker.io/alpine` | -u<br /><br />*or*<br /><br />--image-url                    |          `N/A`           |
|             DEBUG              | Enables debugging mode for Trawler so that more information is displayed in the console output. Note that for usage with .env files or enviroment variables the valid options are as follows:<br />- `0`: Debugging OFF<br />- `1`: Debugging ON | -D<br /><br />*or*<br /><br />--debug                        |           `0`            |

<br>

## Usage

As mentioned above in the introduction, trawler has two distinct methods of being run. This section will cover those two sections as well as show example commands for each method of usage.



### Standalone Mode:

In standalone mode Trawler will scan an image provided by any of the methods outlined in the above Configuration section. In order to utilize this mode, you will need to provide at a minimum the following items:

- m9sweeper API URL
- m9sweeper API token
- The name of the cluster that trawler will send the scan results too as it is defined in m9sweeper
- A docker image URL

Note that if your docker registry requires authentication, then you should ensure that it is defined in m9sweeper as Trawler will get a list of your configured docker registries from m9sweeper. Below is an example command of running a standalone scan of the base alpine docker image.

```shell
trawler scan --url="https://dev-m9sweeper.ngrok.io" --api-key='APIKEYGOESHERE' \
	--cluster-name="default-cluster" \
	--image-url="docker.io/alpine"
```



### Listener Mode:

In listener mode Trawler will be started like a daemon and will monitor a RabbitMQ server for scan jobs sent to it from m9sweeper. This will run continuously and will perform the scans and report the scan results back to m9sweeper as needed based on the jobs sent to it. When launching Trawler in this mode you will need to provide the following items at a minumum:

- m9sweeper API URL
- m9sweeper API token
- The name of the cluster that trawler will send the scan results too as it is defined in m9sweeper
- RabbitMQ authentication (username and password)
- RabbitMQ server information (hostname/ip address and a port)

Note that if your RabbitMQ server is configured to utilize a different queue name than the default of `trawler_queue` then you should provide that as well, same with the port that RabbitMQ is on. If that is different than the default `5672` you should specify that. Below is an example command of running Trawler in its listening mode.

```shell
trawler listen --url="https://dev-m9sweeper.ngrok.io" --api-key='APIKEYGOESHERE' \
	--parallel-scans=1 \
	--rabbitmq-user="admin" \
	--rabbitmq-password="admin" \
	--rabbitmq-host="localhost"
```

<br>

## Development 

We welcome any meaningful contribution to Trawler from the community. In order to make this as easy as possible this section covers items specific to the development of Trawler such as dependencies and special processes.

### Dependencies:

Trawler uses a customized version of Java called GraalVM in order to be able to compile the project into native executables such as Linux binaries. In order to develop with m9sweeper you will need to have this installed.

To install GraalVM, following the official instructions for your platform at https://www.graalvm.org/latest/docs/getting-started/ ensuring that you select an option that contains Java 17.

After you install GraalVM you will want to ensure you install the native-image plugin. Instructions for that are located directly below the instructions you used to install GraalVM itself to your machine.

### Building and Running:

TBD

### Regenerating M9sweeper API Client

To generate the M9sweeper API client, update the swagger-spec.json and run this command:

    ./mvnw swagger-codegen:generate antrun:run@copy-swagger-api-client-src

To get an updated version of the swagger-spec.json, go to the url https://dev-m9sweeper.intelletive.com/trawler-doc-json and copy the provided JSON file

If running a local instance of dash, the JSON can be accessed at the backend port, by default localhost:3200/trawler-doc-json
