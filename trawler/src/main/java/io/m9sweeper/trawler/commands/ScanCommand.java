package io.m9sweeper.trawler.commands;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.m9sweeper.trawler.ScanRunner;
import io.m9sweeper.trawler.Trawler;
import io.m9sweeper.trawler.TrawlerConfiguration;
import io.m9sweeper.trawler.framework.TrawlerRunMode;
import io.m9sweeper.trawler.framework.client.api.M9SweeperApi;
import io.m9sweeper.trawler.framework.client.handler.ApiClient;
import io.m9sweeper.trawler.framework.client.handler.ApiException;
import io.m9sweeper.trawler.framework.client.handler.Configuration;
import io.m9sweeper.trawler.framework.client.handler.auth.ApiKeyAuth;
import io.m9sweeper.trawler.framework.client.model.*;
import io.m9sweeper.trawler.framework.exception.NoncompliantException;
import io.m9sweeper.trawler.framework.queue.Cluster;
import io.m9sweeper.trawler.framework.queue.Image;
import io.m9sweeper.trawler.framework.queue.Message;
import io.m9sweeper.trawler.framework.queue.Registry;
import picocli.CommandLine;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CommandLine.Command(name = "scan", description = "Scan a single docker image in the standalone scan mode.")
public class ScanCommand extends AbstractCommand implements Runnable {
    M9SweeperApi api;

    @CommandLine.ParentCommand
    Trawler parentCommand;

    @CommandLine.Option(names = {"-u", "--image-url"}, description = "URL of docker image to scan", order = 3)
    String dockerImageUrl;

    @CommandLine.Option(names = {"-c", "--cluster-name"}, description = "name of cluster to report results too in m9sweeper", order = 4)
    String clusterName;

    /**
     * Update the configuration using the options in this command
     */
    protected void updateConfig() {
        super.updateConfig();

        // If the clusterName was defined, override what is declared in the env vars
        if (clusterName != null) {
            TrawlerConfiguration.getInstance().setClusterName(clusterName);
        }

        // If the dockerImageUrl was defined, override what is declared in the env vars
        if (dockerImageUrl != null) {

            // if full docker image url is not provided, will provide default hostname and tagname
            Pattern p = Pattern.compile("^([a-zA-Z0-9]+\\.[a-zA-Z0-9\\.]+)?\\/?([a-zA-Z0-9\\/]+)?\\:?([a-zA-Z0-9\\.]+)?$");
            Matcher m = p.matcher(dockerImageUrl);
            if (m.matches()){

                String hostname = m.group(1) != null ? m.group(1) : "docker.io";
                String imagename = m.group(2);
                String tagname = m.group(3) != null ? m.group(3) : "latest";

                dockerImageUrl = hostname + "/" + imagename + ":" + tagname;
            }
            TrawlerConfiguration.getInstance().setDockerImageUrl(dockerImageUrl);
        }
    }

    @Override
    public void run() {
        ScanRunner scanRunner = null;
        ClusterDto clusterInfo = null;
        try {
            // Update configuration options
            parentCommand.updateConfig();
            updateConfig();
            TrawlerConfiguration.getInstance().setTrawlerRunMode(TrawlerRunMode.STANDALONE);
            TrawlerConfiguration.getInstance().verifyConfig();

            // Configure the m9sweeper API client
            ApiClient defaultClient = Configuration.getDefaultApiClient();
            defaultClient.setBasePath(TrawlerConfiguration.getInstance().m9sweeperUrl());
            ApiKeyAuth xAuthToken = (ApiKeyAuth) defaultClient.getAuthentication("x-auth-token");
            xAuthToken.setApiKey(TrawlerConfiguration.getInstance().m9sweeperApiKey());
            api = new M9SweeperApi(defaultClient);

            // Create the base message used in place of contacting the RabbitMQ server
            Message queueMessage = new Message();

            DockerRegistriesResponseDto registryInfo = getDockerRegistry();

            if (registryInfo.getData() != null && registryInfo.getData().getList() != null && registryInfo.getData().getList().size() > 0) {
                DockerRegistriesDto dockerRegistriesDto = registryInfo.getData().getList().get(0);

                Registry registry = new Registry();
                registry.setId(dockerRegistriesDto.getId().longValue());
                registry.setName(dockerRegistriesDto.getName());
                registry.setHostname(dockerRegistriesDto.getHostname());
                registry.setUsername(dockerRegistriesDto.getUsername());
                registry.setPassword(dockerRegistriesDto.getPassword());
                registry.setLoginRequired(dockerRegistriesDto.isLoginRequired());
                registry.setAuthType(dockerRegistriesDto.getAuthType());
                registry.setAuthDetails(dockerRegistriesDto.getAuthDetails());


                queueMessage.setRegistry(registry);


                ClusterResponse clusterResponse = api.clusterControllerGetClusterByClusterName(TrawlerConfiguration.getInstance().clusterName());
                clusterInfo = clusterResponse.getData();
                if (clusterInfo != null) {
                    Cluster cluster = new Cluster();
                    cluster.setId(clusterInfo.getId().longValue());
                    cluster.setName(clusterInfo.getName());

                    queueMessage.setCluster(cluster);

                    ImageDetailsResponseDto imageDetails = api.imageControllerGetImageByDockerUrl(clusterInfo.getId(), TrawlerConfiguration.getInstance().dockerImageUrl());
                    ImageDetailsDto imageDetailsDto;
                    if (imageDetails.getData() != null) {
                        imageDetailsDto = imageDetails.getData();
                        if (imageDetailsDto.getId() == null) {
                            ImageCreateDto imageCreateDto = new ImageCreateDto();
                            imageCreateDto.setName(imageDetailsDto.getName());
                            imageCreateDto.setTag(imageDetailsDto.getTag());
                            imageCreateDto.setUrl(imageDetailsDto.getUrl());
                            ImageDetailsResponseDto imageCreateResponse = api.imageControllerCreateImage(imageCreateDto, true, clusterInfo.getId());
                            if (imageCreateResponse.getData() != null) {
                                imageDetailsDto = imageCreateResponse.getData();
                            }
                        }

                        if (imageDetailsDto.getId() != null) {
                            Image image = new Image();
                            image.setId(imageDetailsDto.getId().longValue());
                            String[] dockerImagePathArray = imageDetailsDto.getName().split("/");
                            image.setPath(dockerImagePathArray.length > 1 ? String.join("/", Arrays.copyOf(dockerImagePathArray, dockerImagePathArray.length - 1)) : "");
                            image.setName(imageDetailsDto.getName());
                            image.setTag(imageDetailsDto.getTag());
                            image.setUrl(imageDetailsDto.getUrl());
                            image.setHash(imageDetailsDto.getDockerImageId());

                            queueMessage.setImage(image);

                            PoliciesByClusterResponse policiesByClusterResponse = api.policyControllerGetPoliciesByClusterId(new BigDecimal(cluster.getId()));
                            if (policiesByClusterResponse.isSuccess() && policiesByClusterResponse.getData() != null && policiesByClusterResponse.getData().size() > 0) {
                                scanRunner = new ScanRunner(api, queueMessage, policiesByClusterResponse.getData());
                                scanRunner.scan();
                            } else {
                                throw new Exception("No policies found for cluster '" + TrawlerConfiguration.getInstance().clusterName() + "'");
                            }
                        } else {
                            throw new Exception("No docker image found for '" + TrawlerConfiguration.getInstance().dockerImageUrl() + "'");
                        }
                    }
                } else {
                    throw new Exception("No cluster found with name '" + TrawlerConfiguration.getInstance().clusterName() + "'");
                }
            } else {
                String url = TrawlerConfiguration.getInstance().dockerImageUrl().split("/")[0];
                throw new Exception("No docker registry found with repository url '" + url + "'");
            }
        } catch (NoncompliantException ex) {
            System.out.println("Image Non-Compliant");
            if (ex.getScanResults() != null) {
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                System.out.println(gson.toJson(Map.of(
                        "summary", Map.of(
                                "criticalIssues", ex.getScanResults().stream().map(scanResult -> scanResult.getCriticalIssues()).reduce(BigDecimal.ZERO, BigDecimal::add),
                                "majorIssues", ex.getScanResults().stream().map(scanResult -> scanResult.getMajorIssues()).reduce(BigDecimal.ZERO, BigDecimal::add),
                                "mediumIssues", ex.getScanResults().stream().map(scanResult -> scanResult.getMediumIssues()).reduce(BigDecimal.ZERO, BigDecimal::add),
                                "lowIssues", ex.getScanResults().stream().map(scanResult -> scanResult.getLowIssues()).reduce(BigDecimal.ZERO, BigDecimal::add),
                                "negligibleIssues", ex.getScanResults().stream().map(scanResult -> scanResult.getNegligibleIssues()).reduce(BigDecimal.ZERO, BigDecimal::add)
                        ),
                        "policies", ex.getScanResults()
                )));
            }
            System.exit(clusterInfo.isIsImageScanningEnforcementEnabled() ? 1 : 0);
        } catch (Exception ex) {
            // @TODO: Save exception message in image scan results table
            ex.printStackTrace();
            System.err.println("ROOT exception: " + ex.getMessage());
            System.exit(1);
        }
    }

    private DockerRegistriesResponseDto getDockerRegistry() throws ApiException {

        // get docker image url
        String url = TrawlerConfiguration.getInstance().dockerImageUrl().split("/")[0];
        return api.dockerRegistriesControllerGetDockerRegistries(null, null, "id", "asc",
                null, null, url);
    }
}
