package io.m9sweeper.trawler.framework.scans;

public class ScanResultIssue {
    // The ID of the scanner that produced the issue
    private int scannerId;

    private String scannerName;

    // The name of the issue
    private String name;

    // The type of the issue
    private String type;

    // The severity of the issue
    private IssueSeverity severity;

    // The description of the issue
    private String description;

    // If the issue is within the policy limits
    private boolean isCompliant;

    // If the issue can be fixed by m9sweeper
    private boolean isFixable;

    private String vulnerabilityDescUrl;

    private String extraData;


    /**
     * Get the ID of the scanner that produced the issue
     *
     * @return the ID of the scanner
     */
    public int getScannerId() {
        return scannerId;
    }

    /**
     *  Set the ID of the scanner that produced the issue
     *
     * @param scannerId the ID of the scanner
     */
    public void setScannerId(int scannerId) {
        this.scannerId = scannerId;
    }

    /**
     * Get the name of the issue
     *
     * @return the name of the issue
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the issue
     *
     * @param name the name of the issue
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the type of issue
     *
     * @return the type of issue
     */
    public String getType() {
        return type;
    }

    /**
     * Set the type of issue
     *
     * @param type the type of issue
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Get the severity of the issue
     *
     * @return the severity of the issue
     */
    public IssueSeverity getSeverity() {
        return severity;
    }

    /**
     * Set the severity of the issue
     *
     * @param severity the severity of the issue
     */
    public void setSeverity(IssueSeverity severity) {
        this.severity = severity;
    }

    /**
     * Get the description of the issue
     *
     * @return the description of the issue
     */
    public String getDescription() {
        return description;
    }

    /**
     * Set the description of the issue
     *
     * @param description the description of the issue
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Get if the issue is within limits of a policy
     *
     * @return the compliance status of the issue
     */
    public boolean isCompliant() {
        return isCompliant;
    }

    /**
     * Set if the issue is within limits of a policy
     *
     * @param complaint the compliance status of the issue
     */
    public void setCompliant(boolean complaint) {
        isCompliant = complaint;
    }

    /**
     * Get if the issue is fixable by m9sweeper
     *
     * @return if the issue is fixable
     */
    public boolean isFixable() {
        return isFixable;
    }

    /**
     * Set if the issue is fixable by m9sweeper
     *
     * @param fixable if the issue is fixable
     */
    public void setFixable(boolean fixable) {
        isFixable = fixable;
    }

    public String getScannerName() {
        return scannerName;
    }

    public void setScannerName(String scannerName) {
        this.scannerName = scannerName;
    }

    public String getVulnerabilityDescUrl() {
        return vulnerabilityDescUrl;
    }

    public void setVulnerabilityDescUrl(String vulnerabilityDescUrl) {
        this.vulnerabilityDescUrl = vulnerabilityDescUrl;
    }

    public String getExtraData() {
        return extraData;
    }

    public void setExtraData(String extraData) {
        this.extraData = extraData;
    }

    @Override
    public String toString() {
        return "ScanResultIssue{" +
                "scannerId=" + scannerId +
                ", scannerName=" + scannerName +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", severity=" + severity +
                ", description='" + description + '\'' +
                ", isCompliant=" + isCompliant +
                ", isFixable=" + isFixable +
                ", extraData=" + extraData +
                '}';
    }
}