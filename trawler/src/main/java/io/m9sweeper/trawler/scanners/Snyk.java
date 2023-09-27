package io.m9sweeper.trawler.scanners;

import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import io.m9sweeper.trawler.framework.scans.ScanConfig;
import io.m9sweeper.trawler.framework.scans.ScanResultIssue;
import io.m9sweeper.trawler.framework.scans.Scanner;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class Snyk implements Scanner {
    ScanConfig config;
    String rawResults;
    ArrayList<ScanResultIssue> scanResultIssues;

    @Override
    public void initScanner(ScanConfig scanConfig) {
        this.config = scanConfig;
    }

    @Override
    public void prepSystem() {
        this.rawResults = "";
        this.scanResultIssues = new ArrayList<>(0);
    }

    @Override
    public void runScan() throws Exception {
        String fullPath = config.getImage().buildFullPath(false, true);
        String policyName = config.getPolicy().getName();
        String scannerName = config.getScannerName();
        System.out.println("Initiating scan of " + fullPath + " with Snyk for " + policyName + ":" + scannerName);

        StringBuilder snykScanCommandBuilder = new StringBuilder();
        snykScanCommandBuilder.append(this.buildAuth());

        // add the snyk call to the command
        snykScanCommandBuilder.append("snyk container test --json ");
        String imageFullPath = config.getImage().buildFullPath(true, true);
        snykScanCommandBuilder.append(this.escapeXsi(imageFullPath)).append("; ");

        this.rawResults = this.runProcess(snykScanCommandBuilder.toString());
    }

    @Override
    public String buildAuth() throws Exception {
        StringBuilder snykAuthorization = new StringBuilder();

        String snykToken = this.escapeXsi("");
        this.authorizationEnvVars.put("SNYK_TOKEN", snykToken);

        // If registry is Amazon Container Registry, set aws access key and secret key to get token
        DockerRegistry registry = config.getImage().getRegistry();
        String authType = registry.getAuthType();
        if ("ACR".equals(authType)) {
            BasicAuthorization acrAuth = getACRRegistryAuthorization(registry);
            this.authorizationEnvVars.put("SNYK_REGISTRY_USERNAME", acrAuth.username);
            this.authorizationEnvVars.put("SNYK_REGISTRY_PASSWORD", acrAuth.password);
        } else if ("AZCR".equals(authType)) {
            AZCRAuthorization azcrAuth = getAZCRRegistryAuthorization(registry);
            this.authorizationEnvVars.put("AZURE_CLIENT_ID", azcrAuth.clientId);
            this.authorizationEnvVars.put("AZURE_CLIENT_SECRET", azcrAuth.clientSecret);
            this.authorizationEnvVars.put("AZURE_TENANT_ID", azcrAuth.tenantId);
        } else if (registry.getIsLoginRequired()) {
            this.authorizationEnvVars.put("SNYK_REGISTRY_USERNAME", this.escapeXsi(registry.getUsername()));
            this.authorizationEnvVars.put("SNYK_REGISTRY_PASSWORD", this.escapeXsi(registry.getPassword()));
        } else if ("GCR".equals(authType)) {
            GCRAuthorization gcrAuth = getGCRRegistryAuthorization(registry);
            // note that we add this directly to the builder and not to the env vars
            snykAuthorization
                    .append("cat ")
                    .append(gcrAuth.credentialPath)
                    .append("docker login -u _json_key --password-stdin; ");
        }

        // add authorization to the command
        String registryAuthorizationEnvVars = this.templateEnvVars();
        snykAuthorization.append(registryAuthorizationEnvVars);

        return snykAuthorization.toString();
    }

    @Override
    public void parseResults() {}

    @Override
    public void cleanup() {}

    @Override
    public List<ScanResultIssue> getScanResult() {
        return scanResultIssues;
    }
}
