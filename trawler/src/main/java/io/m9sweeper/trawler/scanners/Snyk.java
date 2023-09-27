package io.m9sweeper.trawler.scanners;

import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import io.m9sweeper.trawler.framework.scans.ScanConfig;
import io.m9sweeper.trawler.framework.scans.ScanResultIssue;
import io.m9sweeper.trawler.framework.scans.Scanner;

import java.util.ArrayList;
import java.util.List;

public class Snyk implements Scanner {
    private ScanConfig config;
    private String rawResults;
    ArrayList<ScanResultIssue> scanResultIssues;

    /**
     * Initializes the Scanner. This is a required Scanner method
     * and is used to initialize the configuration for the plugin and any
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
    public void prepSystem() {}

    /**
     * Runs the scan as defined by the ScanConfig passed into the scanner
     * in the {@link #initScanner(ScanConfig)} method. This should start the scan,
     * and wait for it to complete. Raw scan results should be saved so that they
     * can be executed in the next stage, {@link #parseResults()}.
     */
    @Override
    public void runScan() throws Exception {
        String fullPath = config.getImage().buildFullPath(false, true);
        String policyName = config.getPolicy().getName();
        String scannerName = config.getScannerName();
        System.out.println("Initiating scan of " + fullPath + " with Snyk for " + policyName + ":" + scannerName);
        StringBuilder snykScanCommandBuilder = new StringBuilder();

        // If registry is Amazon Container Registry, set aws access key and secret key to get token
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
        snykScanCommandBuilder.append(registryAuthorizationEnvVars);

    }

    /**
     * This runs after the scan has been completed. Logic that will parse the results and store them in
     * the ScanResult object so the result can get reported back to m9sweeper or output to the console
     * if running in the standalone mode.
     */
    @Override
    public void parseResults() {}

    /**
     * Report the results of the scan to m9sweeper.
     */
    @Override
    public List<ScanResultIssue> getScanResult() {
        return scanResultIssues;
    }

    /**
     * Cleans up the host system and any plugin specific items. This is run after the
     * method and should be used to remove any containers, images,
     * networks, or other resources created while running the scan.
     */
    @Override
    public void cleanup() {}

}
