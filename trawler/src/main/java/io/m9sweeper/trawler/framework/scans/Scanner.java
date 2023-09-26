package io.m9sweeper.trawler.framework.scans;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.ecr.AmazonECR;
import com.amazonaws.services.ecr.AmazonECRClientBuilder;
import com.amazonaws.services.ecr.model.GetAuthorizationTokenRequest;
import com.amazonaws.services.ecr.model.GetAuthorizationTokenResult;
import io.m9sweeper.trawler.TrawlerConfiguration;
import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import org.apache.commons.text.StringEscapeUtils;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * Create and run the scanner. This runnable defaults to running the scanner methods in the following order:
 * 1. initScanner()
 * 2. prepSystem()
 * 3. runScan()
 * 4. parseResults()
 * 5. cleanup()
 *
 * You may wish to override the default run method described here to better handle errors for the scanner.
 */
public interface Scanner extends Runnable {
    /**
     * Initializes the Scanner. This is a required Scanner method
     * and is should be used to initialize the configuration for the plugin and any
     * plugin specific things. This acts as the constructor for the scanner.
     *
     * @param scanConfig        the ScanConfig that defines the plugin settings and scan information
     * @see ScanConfig
     * @see io.m9sweeper.trawler.framework.scans.Scanner
     */
    void initScanner(ScanConfig scanConfig);

    /**
     * Prepares the host system and plugin for running a scan.
     * Anything that needs to be done prior to a scan being run
     * should be placed in here.
     */
    void prepSystem();

    /**
     * Runs the scan as defined by the ScanConfig passed into the scanner
     * in the {@link #initScanner(ScanConfig)} method. This should start the scan,
     * and wait for it to complete. Raw scan results should be saved so they can be executed
     * in the next stage, {@link #parseResults()}.
     */
    void runScan() throws Exception;

    /**
     * This runs after the scan has been completed. Logic that will parse the results and store them in
     * the ScanResult object so the result can get reported back to m9sweeper or output to the console
     * if running in the standalone mode.
     */
    void parseResults();

    /**
     * Cleans up the host system and any plugin specific items. This method and should be used to
     * remove any containers, images, networks, or other resources created while running the scan.
     */
    void cleanup();

    /**
     * Report the results of the scan to m9sweeper.
     */
    List<ScanResultIssue> getScanResult();

    /**
     * This is the default run method the runnable will use when being executed. It can be overwritten
     * in the scanner class if you wish to customize its execution or error handling.
     */
    @Override
    default void run() throws RuntimeException {
        try {
            prepSystem();
            runScan();
            parseResults();
            cleanup();
        } catch (Exception ex) {
            System.err.println("RuntimeException");
            ex.printStackTrace();
            throw new RuntimeException(ex);
        }
    }

    default String getRegistryAuthorization(DockerRegistry registry) throws Exception {
        String authType = registry.getAuthType();
        if ("ACR".equals(authType)) {
            return getACRRegistryAuthorization(registry);
        } else if ("GCR".equals(authType)) {
            return getGCRRegistryAuthorization(registry);
        } else if ("AZCR".equals(authType)) {
            return getAZCRRegistryAuthorization(registry);
        } else if (registry.getIsLoginRequired()) {
            String authPartOne = "export TRIVY_USERNAME=" + escapeXsi(registry.getUsername()) + "; ";
            String authPartTwo = "export TRIVY_PASSWORD=" + escapeXsi(registry.getPassword()) + "; ";
            return authPartOne + authPartTwo;
        }
        return "";
    }

    private String escapeXsi(String authToken) {
        return StringEscapeUtils.escapeXSI(authToken);
    }

    default String getACRRegistryAuthorization(DockerRegistry registry) {
        String aws_account_id = TrawlerConfiguration.getInstance().dockerImageUrl().split("\\.")[0];

        try {
            Map<String, Object> authDetails = (Map<String, Object>) registry.getAuthDetails();

            String region = authDetails.getOrDefault("acrDefaultRegion", "").toString();
            String accessKey = authDetails.getOrDefault("acrAccessKey", "").toString();
            String secretKey = authDetails.getOrDefault("acrSecretKey", "").toString();

            AWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
            AmazonECR amazonECR = AmazonECRClientBuilder.standard()
                    .withRegion(region)
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .build();

            //Get Auth Token for Repository using its registry ID
            GetAuthorizationTokenRequest request = new GetAuthorizationTokenRequest().withRegistryIds(aws_account_id);
            GetAuthorizationTokenResult authorizationData = amazonECR.getAuthorizationToken(request);
            String authTokenBase64 = authorizationData.getAuthorizationData().get(0).getAuthorizationToken();
            byte[] decodedBytes = Base64.getDecoder().decode(authTokenBase64);
            String decodedString = new String(decodedBytes);
            String authToken = decodedString.substring(4); // skip AWS: at the start of the string

            String authorization = "export TRIVY_USERNAME=" + escapeXsi("AWS") + "; ";
            String authPartTwo = "export TRIVY_PASSWORD=" + escapeXsi(authToken) + "; ";
            return authorization + authPartTwo;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    default String getGCRRegistryAuthorization(DockerRegistry registry) throws Exception {
        // Create a temporary auth file for the Scanner to use for authentication with GCR
        File gcrAuthFile = File.createTempFile("gcrAuthFile-", ".json");

        // Fetch the authentication details from the registry details
        Map<String, Object> authDetails = (Map<String, Object>) registry.getAuthDetails();

        // Write the auth JSON to the temp JSON file
        try (FileWriter writer = new FileWriter(gcrAuthFile)) {
            writer.write(authDetails.getOrDefault("gcrAuthJson", "").toString());
        } catch (IOException e) {
            e.printStackTrace();
        }

        // Ensure that the file is deleted upon exiting so that we do not leave credentials lying around.
        gcrAuthFile.deleteOnExit();

        // Export the location of this file so that the scanner can utilize it
        return "export GOOGLE_APPLICATION_CREDENTIALS=" + gcrAuthFile.getAbsolutePath() + "; ";
    }

    default String getAZCRRegistryAuthorization(DockerRegistry registry) {
        // Azure Container Registry images are accessed with a service principal set up beforehand. Trawler only needs to
        // export the Client ID, Secret, and Tenant ID of the service principal to allow Trivy to connect to it
        Map<String, Object> authDetails = (Map<String, Object>) registry.getAuthDetails();

        String clientId = authDetails.getOrDefault("azureClientId", "").toString();
        String clientSecret = authDetails.getOrDefault("azureClientSecret", "").toString();
        String tenantId = authDetails.getOrDefault("azureTenantId", "").toString();

        String authPartOne = "export AZURE_CLIENT_ID=" + escapeXsi(clientId) + "; ";
        String authPartTwo = "export AZURE_CLIENT_SECRET=" + escapeXsi(clientSecret) + "; ";
        String authPartThree = "export AZURE_TENANT_ID=" + escapeXsi(tenantId) + "; ";
        return authPartOne + authPartTwo + authPartThree;
    }
}
