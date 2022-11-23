package io.m9sweeper.trawler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import io.m9sweeper.trawler.commands.AbstractCommand;
import io.m9sweeper.trawler.commands.ScanCommand;
import io.m9sweeper.trawler.framework.TrawlerRunMode;
import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;
import io.m9sweeper.trawler.framework.client.handler.ApiClient;
import io.m9sweeper.trawler.framework.client.handler.ApiException;
import io.m9sweeper.trawler.framework.client.handler.Configuration;
import io.m9sweeper.trawler.framework.client.handler.auth.ApiKeyAuth;
import io.m9sweeper.trawler.framework.client.model.DockerRegistriesDto;
import io.m9sweeper.trawler.framework.client.model.DockerRegistriesResponseDto;
import io.m9sweeper.trawler.framework.client.model.PoliciesByClusterResponse;
import io.m9sweeper.trawler.framework.queue.Message;
import io.m9sweeper.trawler.framework.queue.Registry;
import picocli.CommandLine;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

@CommandLine.Command(name = "trawler", description = "Run Trawler in its RabbitMQ mode where it will monitor " +
        "a specified RabbitMQ queue for scan jobs.", subcommands = ScanCommand.class)
public class Trawler extends AbstractCommand implements Runnable {

    @CommandLine.Option(names = {"-u", "--rabbitmq-user"}, description = "username of the RabbitMQ server", order = 3)
    String rabbitmqUsername;

    @CommandLine.Option(names = {"-p", "--rabbitmq-password"}, description = "password of the RabbitMQ server", order = 4)
    String rabbitmqPassword;

    @CommandLine.Option(names = {"-H", "--rabbitmq-host"}, description = "hostname of the RabbitMQ server", order = 5)
    String rabbitmqHostname;

    @CommandLine.Option(names = {"-t", "--rabbitmq-port"}, description = "port of the RabbitMQ server", order = 6)
    int rabbitmqPort;

    @CommandLine.Option(names = {"-q", "--rabbitmq-queue"}, description = "name of the RabbitMQ queue to listen on", order = 7)
    String rabbitmqQueueName;

    /**
     * Run the main application for Trawler. This runs the default command, the basic trawler command which will start
     * the application in the rabbitmq mode.
     * @param args Application arguments from the CLI command launching trawler
     */
    public static void main(String[] args) {
        // Create an instance of the TrawlerConfiguration to ensure it fetches any
        // environment variables that have been set already in the .env file.
        TrawlerConfiguration.getInstance();

        // Launch the trawler command or its subcommands
        new CommandLine(new Trawler()).execute(args);
    }

    /**
     * Update the configuration based on variables that were passed into the application as CLI options
     */
    public void updateConfig() {
        // Update the number of parallel scanners if the number provided by CLI is different than that of the env var
        if (trawlerParallelScanners != null) {
            TrawlerConfiguration.getInstance().setTrawlerParallelScanners(trawlerParallelScanners);
        }

        // If the m9sweeper URL was defined, override what is declared in env vars
        if (m9sweeperUrl != null) {
            TrawlerConfiguration.getInstance().setM9sweeperUrl(m9sweeperUrl);
        }

        // If the m9sweeperApiKey was defined, override what is declared in the env vars
        if (m9sweeperApiKey != null) {
            TrawlerConfiguration.getInstance().setM9sweeperApiKey(m9sweeperApiKey);
        }

        // If the rabbitmqUsername was defined, override what is declared in the env vars
        if (rabbitmqUsername != null) {
            TrawlerConfiguration.getInstance().setRabbitmqUsername(rabbitmqUsername);
        }

        // If the rabbitmqPassword was defined, override what is declared in the env vars
        if (rabbitmqPassword != null) {
            TrawlerConfiguration.getInstance().setRabbitmqPassword(rabbitmqPassword);
        }

        // If the rabbitmqHostname was defined, override what is declared in the env vars
        if (rabbitmqHostname != null) {
            TrawlerConfiguration.getInstance().setRabbitmqHostname(rabbitmqHostname);
        }

        // Update the rabbitmqPort if the number provided by CLI is different than that of the env var
        if (rabbitmqPort != 0) {
            TrawlerConfiguration.getInstance().setRabbitmqPort(rabbitmqPort);
        }

        // If the rabbitmqQueueName was defined, override what is declared in the env vars
        if (rabbitmqQueueName != null) {
            TrawlerConfiguration.getInstance().setRabbitmqQueueName(rabbitmqQueueName);
        }
    }

    private Connection getAmpqConnection(ConnectionFactory factory, int retry) throws InterruptedException {
        try {
            return factory.newConnection();
        } catch (IOException | TimeoutException e) {
            e.printStackTrace();
            if (retry > 0) {
                System.out.println("Error: Connection timed out to RabbitMQ server. Retrying....");
                Thread.sleep(factory.getNetworkRecoveryInterval());
                return getAmpqConnection(factory, --retry);
            }
            throw new RuntimeException("Failed to connect to RabbitMQ");
        }
    }

    /**
     * If this command is called, run trawler as a background service listening to the RabbitMQ server
     */
    @Override
    public void run() {
        // TODO: Update config and verify it
        updateConfig();
        TrawlerConfiguration.getInstance().setTrawlerRunMode(TrawlerRunMode.RABBITMQ);
        TrawlerConfiguration.getInstance().verifyConfig();

        // Configure the API client
        ApiClient defaultClient = Configuration.getDefaultApiClient();
        defaultClient.setBasePath(TrawlerConfiguration.getInstance().m9sweeperUrl());
        ApiKeyAuth xAuthToken = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
        xAuthToken.setApiKey(TrawlerConfiguration.getInstance().m9sweeperApiKey());
        M9SweeperApi api = new M9SweeperApi(defaultClient);

        // Configure the RabbitMQ Connection
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(TrawlerConfiguration.getInstance().rabbitmqHostname());
        factory.setPort(TrawlerConfiguration.getInstance().rabbitmqPort());
        factory.setUsername(TrawlerConfiguration.getInstance().rabbitmqUsername());
        factory.setPassword(TrawlerConfiguration.getInstance().rabbitmqPassword());
        factory.setAutomaticRecoveryEnabled(true);
        factory.setTopologyRecoveryEnabled(true); 
        factory.setConnectionTimeout(5000);
        factory.setNetworkRecoveryInterval(5000);

        try {
            // Create the connection and connection channel to RabbitMQ
            Connection connection = getAmpqConnection(factory, 10);

            Channel channel = connection.createChannel();

            // Select the right RabbitMQ Queue to monitor
            channel.queueDeclare(TrawlerConfiguration.getInstance().rabbitmqQueueName(), true, false, false, null);

            // Display a message stating that Trawler is listening for messages
            System.out.println("Trawler is waiting for scan jobs...");

            // Consume a message from the queue and execute the scan accordingly
            channel.basicConsume(TrawlerConfiguration.getInstance().rabbitmqQueueName(), true, (consumerTag, delivery) -> {
                try {
                    ObjectMapper mapper = new ObjectMapper();

                    // Get the contents of the message
                    String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
                    Message payload = mapper.readValue(message, Message.class);
                        
                    try {
                        DockerRegistriesResponseDto registries = api.dockerRegistriesControllerGetDockerRegistries(
                                null, null, "id", "asc",
                                null, null, payload.getRegistry().getHostname());
                        if (registries.getData().getList().isEmpty()) {
                            throw new RuntimeException("Invalid docker registry");
                        }

                        DockerRegistriesDto registriesDto = registries.getData().getList().get(0);

                        // convert to proper class name (for some reason its defined 2 different ways... go figure)
                        Registry registry = new Registry();
                        registry.setId(Long.valueOf(registriesDto.getId().toString()));
                        registry.setAliases(registriesDto.getAliases());
                        registry.setHostname(registriesDto.getHostname());
                        registry.setAuthType(registriesDto.getAuthType());
                        registry.setName(registriesDto.getName());
                        registry.setUsername(registriesDto.getUsername());
                        registry.setPassword(registriesDto.getPassword());
                        registry.setAuthDetails(registriesDto.getAuthDetails());
                        registry.setLoginRequired(registriesDto.isLoginRequired());

                        payload.setRegistry(registry);
                    } catch (Exception e) {
                        // @TODO: Should save that it faileda nd why it failed back (the exception message)
                        e.printStackTrace(); 
                    } 

                    // Run the scan as long as the contents of the message are valid
                    if (payload != null && payload.getCluster() != null && payload.getCluster().getId() != null) {
                        try {
                            PoliciesByClusterResponse policiesByClusterResponse = api.policyControllerGetPoliciesByClusterId(new BigDecimal(payload.getCluster().getId()));
                            if (policiesByClusterResponse.isSuccess() && policiesByClusterResponse.getData() != null && policiesByClusterResponse.getData().size() > 0) {
                                System.out.println("Job received, starting scan.");
                                new ScanRunner(api, payload, policiesByClusterResponse.getData()).scan();
                                System.out.println("Scan completed");
                            } else {
                                throw new Exception("No policies found for cluster '" + payload.getCluster().getId() + "'");
                            }
                        } catch (Exception e) {
                            // @TODO: should save that it failed and why it failed (the exception message)
                            e.printStackTrace();
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace(); 
                }
            }, consumerTag -> {});
        } catch (IOException | InterruptedException e) {
            System.out.println("Error: Connection timed out to RabbitMQ server. Please check your configuration and try again.");
        } catch (Exception e) {
            e.printStackTrace();  // something else failed
        }
    }
}
