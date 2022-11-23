package io.m9sweeper.trawler.framework.scans;

import io.m9sweeper.trawler.framework.docker.DockerImage;
import io.m9sweeper.trawler.framework.policies.Policy;

public class ScanConfig {
    // The ID of the scan
    private int scanId;

    private String scannerName;

    // The docker image to scan
    private DockerImage image;

    // The policy to scan with
    private Policy policy;


    /**
     * Get the scan ID
     *
     * @return the ID of the scan
     */
    public int getScanId() {
        return scanId;
    }

    /**
     * Set the scan ID
     *
     * @param scanId the ID of the scan
     */
    public void setScanId(int scanId) {
        this.scanId = scanId;
    }

    public String getScannerName() {
        return scannerName;
    }

    public void setScannerName(String scannerName) {
        this.scannerName = scannerName;
    }

    /**
     * Get the DockerImage to be scanned
     *
     * @return the DockerImage to be scanned
     * @see DockerImage
     */
    public DockerImage getImage() {
        return image;
    }

    /**
     * Set the DockerImage to be scanned
     *
     * @param image the DockerImage to be scanned
     * @see DockerImage
     */
    public void setImage(DockerImage image) {
        this.image = image;
    }

    /**
     * Get the Policy to scan with
     *
     * @return the Policy to scan with
     * @see Policy
     */
    public Policy getPolicy() {
        return policy;
    }

    /**
     * Set the Policy to scan with
     *
     * @param policy the Policy to scan with
     * @see Policy
     */
    public void setPolicy(Policy policy) {
        this.policy = policy;
    }
}