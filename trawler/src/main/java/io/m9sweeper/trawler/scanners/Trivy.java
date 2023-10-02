package io.m9sweeper.trawler.scanners;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import io.m9sweeper.trawler.TrawlerConfiguration;
import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import io.m9sweeper.trawler.framework.scans.*;
import org.apache.commons.text.StringEscapeUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class Trivy implements Scanner {
    private ScanConfig config;
    private String rawResults;
    private String imageHash;
    ArrayList<ScanResultIssue> allIssues;

    @Override
    public void initScanner(ScanConfig scanConfig) {
        this.config = scanConfig;
    }

    @Override
    public void prepSystem() {
        this.rawResults = "";
        this.allIssues = new ArrayList<>(0);
        this.imageHash = "";
    }

    @Override
    public void runScan() throws Exception {
        String fullPath = config.getImage().buildFullPath(false, true);
        String policyName = config.getPolicy().getName();
        String scannerName = config.getScannerName();
        System.out.println("Initiating scan of " + fullPath + " with trivy for " + policyName + ":" + scannerName);

        StringBuilder trivyScanCommandBuilder = new StringBuilder();
        trivyScanCommandBuilder.append(this.buildAuth());

        // Clear Trivy cache
        ProcessBuilder clearCacheProcessBuilder = new ProcessBuilder();
        clearCacheProcessBuilder.command("bash", "-c", "trivy image --clear-cache");
        clearCacheProcessBuilder.redirectErrorStream(true);
        Process clearCacheProcess = clearCacheProcessBuilder.start();
        clearCacheProcess.waitFor();

        // add the trivy call to the command
        trivyScanCommandBuilder.append("trivy -q image --timeout 30m --scanners vuln -f json '");
        String imageFullPath = config.getImage().buildFullPath(true, true);
        trivyScanCommandBuilder.append(this.escapeXsi(imageFullPath)).append("';");

        trivyScanCommandBuilder.append(this.unsetEnvVars());
        this.rawResults = this.runProcess(trivyScanCommandBuilder.toString());
    }

    @Override
    public String buildAuth() throws Exception {
        StringBuilder trivyAuthorization = new StringBuilder();
        DockerRegistry registry = config.getImage().getRegistry();

        String authType = registry.getAuthType();
        if ("ACR".equals(authType)) {
            BasicAuthorization acrAuth = getACRRegistryAuthorization(registry);
            this.authorizationEnvVars.put("TRIVY_USERNAME", acrAuth.username);
            this.authorizationEnvVars.put("TRIVY_PASSWORD", acrAuth.password);
        } else if ("GCR".equals(authType)) {
            GCRAuthorization gcrAuth = getGCRRegistryAuthorization(registry);
            this.authorizationEnvVars.put("GOOGLE_APPLICATION_CREDENTIALS", gcrAuth.credentialPath);
        } else if ("AZCR".equals(authType)) {
            AZCRAuthorization azcrAuth = getAZCRRegistryAuthorization(registry);
            this.authorizationEnvVars.put("AZURE_CLIENT_ID", azcrAuth.clientId);
            this.authorizationEnvVars.put("AZURE_CLIENT_SECRET", azcrAuth.clientSecret);
            this.authorizationEnvVars.put("AZURE_TENANT_ID", azcrAuth.tenantId);
        } else if (registry.getIsLoginRequired()) {
            this.authorizationEnvVars.put("TRIVY_USERNAME", this.escapeXsi(registry.getUsername()));
            this.authorizationEnvVars.put("TRIVY_PASSWORD", this.escapeXsi(registry.getPassword()));
        }
        String registryAuthorizationEnvVars = this.templateEnvVars();
        trivyAuthorization.append(registryAuthorizationEnvVars);

        return trivyAuthorization.toString();
    }

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

    @Override
    public void cleanup() {

    }
}
