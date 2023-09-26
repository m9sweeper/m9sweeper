package io.m9sweeper.trawler.scanners;

import io.m9sweeper.trawler.framework.docker.DockerRegistry;
import io.m9sweeper.trawler.framework.scans.ScanConfig;
import io.m9sweeper.trawler.framework.scans.Scanner;

public class Snyk implements Scanner {
    private ScanConfig config;
    private String rawResults;

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

    }
}
