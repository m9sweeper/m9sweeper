package io.m9sweeper.trawler.scanners;


import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.ecr.AmazonECR;
import com.amazonaws.services.ecr.AmazonECRClientBuilder;
import com.amazonaws.services.ecr.model.GetAuthorizationTokenRequest;
import com.amazonaws.services.ecr.model.GetAuthorizationTokenResult;
import com.google.gson.*;
import io.m9sweeper.trawler.TrawlerConfiguration;
import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import io.m9sweeper.trawler.framework.scans.*;
import org.apache.commons.text.StringEscapeUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

public class Trivy implements Scanner {

    private ScanConfig config;
    private String rawResults;
    private String imageHash;
    ArrayList<ScanResultIssue> allIssues;

    /**
     * Initializes the Scanner. This is a required Scanner method
     * and is should be used to initialize the configuration for the plugin and any
     * plugin specific things. This acts as the constructor for the scanner.
     *
     * @param scanConfig the ScanConfig that defines the plugin settings and scan information
     * @see ScanConfig
     * @see Scanner
     */
    @Override
    public void initScanner(ScanConfig scanConfig) {
        this.config = scanConfig;
    }

    /**
     * Prepares the host system and plugin for running a scan.
     * Anything that needs to be done prior to a scan being run
     * should be placed in here.
     */
    @Override
    public void prepSystem() {
        this.rawResults = "";
        this.allIssues = new ArrayList<>(0);
        this.imageHash = "";
    }

    /**
     * Runs the scan as defined by the ScanConfig passed into the scanner
     * in the {@link #initScanner(ScanConfig)} method. This should start the scan,
     * and wait for it to complete. Raw scan results should be saved so they can be executed
     * in the next stage, {@link #parseResults()}.
     */
    @Override
    public void runScan() throws Exception {
        System.out.println("Initiating scan of " + config.getImage().getName() + ":" + config.getImage().getTag() +
                " with trivy for " + config.getPolicy().getName() + ":" + config.getScannerName());
        StringBuilder trivyScanCommandBuilder = new StringBuilder();

        // If registry is Amazon Container Registry, set aws access key and secret key to get token
        DockerRegistry registry = config.getImage().getRegistry();
        if ("ACR".equals(registry.getAuthType())) {

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

                //Get Auth Token for Repository using it's registry Id
                GetAuthorizationTokenResult authorizationData = amazonECR
                        .getAuthorizationToken(new GetAuthorizationTokenRequest().withRegistryIds(aws_account_id));
                String authTokenBase64 = authorizationData.getAuthorizationData().get(0).getAuthorizationToken();
                byte[] decodedBytes = Base64.getDecoder().decode(authTokenBase64);
                String decodedString = new String(decodedBytes);
                String authToken = decodedString.substring(4); // skip AWS: at the start of the string

                trivyScanCommandBuilder.append("export TRIVY_USERNAME='").append(escapeXsi("AWS")).append("'; ");
                trivyScanCommandBuilder.append("export TRIVY_PASSWORD='").append(escapeXsi(authToken)).append("'; ");
            } catch (Exception e) {
                e.printStackTrace();
            }

        } else if ("GCR".equals(registry.getAuthType())) {
            // Create a temporary auth file for Trivy to use for authentication with GCR
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

            // Export the location of this file so that Trivy can utilize it
            trivyScanCommandBuilder.append("export GOOGLE_APPLICATION_CREDENTIALS='").append(gcrAuthFile.getAbsolutePath()).append("'; ");
        } else if ("AZCR".equals(registry.getAuthType())) {
            // Azure Container Registry images are accessed with a service principal set up beforehand. Trawler only needs to
            // export the Client ID, Secret, and Tenant ID of the service principal to allow Trivy to connect to it
            Map<String, Object> authDetails = (Map<String, Object>) registry.getAuthDetails();

            String clientId = authDetails.getOrDefault("azureClientId", "").toString();
            String clientSecret = authDetails.getOrDefault("azureClientSecret", "").toString();
            String tenantId = authDetails.getOrDefault("azureTenantId", "").toString();

            trivyScanCommandBuilder.append("export AZURE_CLIENT_ID='").append(escapeXsi(clientId)).append("'; ");
            trivyScanCommandBuilder.append("export AZURE_CLIENT_SECRET='").append(escapeXsi(clientSecret)).append("'; ");
            trivyScanCommandBuilder.append("export AZURE_TENANT_ID='").append(escapeXsi(tenantId)).append("'; ");
        } else if (registry.getIsLoginRequired()) {
            trivyScanCommandBuilder.append("export TRIVY_USERNAME='").append(escapeXsi(registry.getUsername())).append("'; ");
            trivyScanCommandBuilder.append("export TRIVY_PASSWORD='").append(escapeXsi(registry.getPassword())).append("'; ");
        }

        // Clear Trivy cache
        ProcessBuilder clearCacheProcessBuilder = new ProcessBuilder();
        clearCacheProcessBuilder.command("bash", "-c", "trivy image --clear-cache");
        clearCacheProcessBuilder.redirectErrorStream(true);

        Process clearCacheProcess = clearCacheProcessBuilder.start();
        clearCacheProcess.waitFor();
        
        // run trivy scan
        trivyScanCommandBuilder.append("trivy -q image --timeout 30m --scanners vuln -f json '");
        trivyScanCommandBuilder.append(escapeXsi(
                registry.getHostname() + "/" + config.getImage().getName() + ":" + config.getImage().getTag()
        ));
        trivyScanCommandBuilder.append("';");

        if (registry.getIsLoginRequired()) {
            trivyScanCommandBuilder.append(" unset TRIVY_USERNAME; unset TRIVY_PASSWORD;");
        }
        if ("AZCR".equals(registry.getAuthType())) {
            trivyScanCommandBuilder.append(" unset AZURE_CLIENT_ID; unset AZURE_CLIENT_SECRET; unset AZURE_TENANT_ID;");
        }

        if (TrawlerConfiguration.getInstance().getDebug()) {
            System.out.println("Scan command: " + trivyScanCommandBuilder.toString());
        }

        ProcessBuilder processBuilder = new ProcessBuilder();
        processBuilder.command("bash", "-c", trivyScanCommandBuilder.toString());
        processBuilder.redirectErrorStream(true);

        Process process = processBuilder.start();

        StringBuilder output = new StringBuilder();
        StringBuilder errorOutput = new StringBuilder();
        StringBuilder jsonScanResultOutput = new StringBuilder();

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(process.getInputStream()));

//        BufferedReader readerErr = new BufferedReader(
//                new InputStreamReader(process.getErrorStream()));

        boolean isJsonOutputStarted = false;

        String line;
        if (TrawlerConfiguration.getInstance().getDebug()) {
            System.out.println("RAW TRIVY STDOUT:");
        }

        while ((line = reader.readLine()) != null) {
            if (TrawlerConfiguration.getInstance().getDebug()) {
                System.out.println(line);
            }

            output.append(line + "\n");

            if (line.startsWith("{") && jsonScanResultOutput.length() == 0) {
                isJsonOutputStarted = true;
            }

            if (isJsonOutputStarted) {
                jsonScanResultOutput.append(line);
            }

            if (line.startsWith("}") && line.length() == 1 && jsonScanResultOutput.length() > 0) {
                isJsonOutputStarted = false;
            }

            if (!line.isEmpty()) {
                if (line.contains("FATAL") || errorOutput.length() > 0) {
                    errorOutput.append(line + "\n");
                }
            }
        }
        String errorMessage = errorOutput.length() > 0 ? errorOutput.substring(errorOutput.indexOf("FATAL") + 10, errorOutput.length()) : errorOutput.toString();
        if (TrawlerConfiguration.getInstance().getDebug() && errorMessage.length() > 0) {
            System.err.println("ERROR: " + errorMessage);
        }

        int exitVal = process.waitFor();
        if (exitVal == 0) {
            if (errorMessage.length() > 0) {
                throw new Exception(errorMessage);
            } else {
                rawResults = jsonScanResultOutput.toString();
            }
        } else {
            throw new Exception(errorMessage);
        }
    }

    private String escapeXsi(String authToken) {
        return StringEscapeUtils.escapeXSI(authToken);
    }

    /**
     * This runs after the scan has been completed. Logic that will parse the results and store them in
     * the ScanResult object so the result can get reported back to m9sweeper or output to the console
     * if running in the standalone mode.
     */
    @Override
    public void parseResults() {

        Gson parser = new Gson();
        JsonObject imageScanObject = parser.fromJson(rawResults, JsonObject.class);
        if (TrawlerConfiguration.getInstance().getDebug() || imageScanObject == null) {
            System.out.println("Parsed Trivy Scan Results: " + imageScanObject.toString());
        }

        if (imageScanObject.get("Metadata") != null && !imageScanObject.get("Metadata").isJsonNull()) {
            JsonObject imageScanMetadata = imageScanObject.getAsJsonObject("Metadata");
            if (imageScanMetadata.get("RepoDigests") != null && !imageScanMetadata.get("RepoDigests").isJsonNull()) {
                JsonArray repoDigests = imageScanMetadata.getAsJsonArray("RepoDigests");
                this.imageHash = repoDigests.get(0).getAsString().split("sha256:")[1];
            }
        }

        if (imageScanObject.get("Results") != null && !imageScanObject.get("Results").isJsonNull()) {
            JsonArray imageScanResults = imageScanObject.getAsJsonArray("Results");
            if (TrawlerConfiguration.getInstance().getDebug())
                System.out.println("Image scan result size: " + imageScanResults.size());
            if (imageScanResults != null && imageScanResults.size() > 0) {
                for (int i = 0; i < imageScanResults.size(); i++) {
                    JsonObject imageScanResult = (JsonObject) imageScanResults.get(i);
                    if (imageScanResult.get("Vulnerabilities") != null && !imageScanResult.get("Vulnerabilities").isJsonNull()) {
                        JsonArray vulnerabilities = imageScanResult.getAsJsonArray("Vulnerabilities");
                        if (vulnerabilities != null && vulnerabilities.size() > 0) {
                            if (TrawlerConfiguration.getInstance().getDebug())
                                System.out.println("Total vulnerabilities found: " + vulnerabilities.size());
                            vulnerabilities.forEach(vulnerability -> {
                                JsonObject v = vulnerability.getAsJsonObject();
                                boolean isHighSeverity = IssueSeverity.CRITICAL.equals(v.get("Severity")) || IssueSeverity.HIGH.equals(v.get("Severity"));
                                ScanResultIssue issue = new ScanResultIssueBuilder(config.getScanId(), config.getScannerName())
                                        .withName(v.get("Title") == null ? "" : v.get("Title").getAsString())
                                        .withDescription(v.get("Description") == null ? "" : v.get("Description").getAsString())
                                        .withSeverity(v.get("Severity") == null ? null : IssueSeverity.valueOf(v.get("Severity").getAsString()))
                                        .withIsCompliant(!isHighSeverity) // TODO: Should reflect policy settings when the feature becomes available
                                        .withType(v.get("VulnerabilityID") == null ? "" : v.get("VulnerabilityID").getAsString())
                                        .withIsFixable(!(v.get("FixedVersion") == null ? "" : v.get("FixedVersion").getAsString()).isEmpty())
                                        .withVulnerabilityDescUrl(v.get("PrimaryURL") == null ? "" : v.get("PrimaryURL").getAsString())
                                        .withExtraData(v.toString())
                                        .build();

                                // only valid issues
                                if (!IssueSeverity.UNKNOWN.equals(issue.getSeverity())) {
                                    allIssues.add(issue);
                                }
                            });
                        }
                    }
                }
            }
        }
    }

    @Override
    public List<ScanResultIssue> getScanResult() {
        return allIssues;
    }

    public String getImageHash() { return imageHash; }

    /**
     * Cleans up the host system and any plugin specific items. This is run after the
     * method and should be used to remove any containers, images,
     * networks, or other resources created while running the scan.
     */
    @Override
    public void cleanup() {

    }
}
