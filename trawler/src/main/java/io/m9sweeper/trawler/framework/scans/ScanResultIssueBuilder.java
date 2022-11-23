package io.m9sweeper.trawler.framework.scans;

/**
 * Provide a way to conveniently build a ScanResultIssue object
 * without using long constructors.
 */
public class ScanResultIssueBuilder {
    private final int scannerId;
    private final String scannerName;
    private String name;
    private String type;
    private String vulnerabilityDescUrl;
    private IssueSeverity severity;
    private String description;
    private boolean isCompliant;
    private boolean isFixable;
    private boolean wasFixed;
    private String extraData;

    /**
     * Default constructor for the ScanResultIssueBuilder which is used to
     * build ScanResultIssue objects.
     *
     * @param scannerId the ID of the scanner that created the issue
     */
    public ScanResultIssueBuilder(int scannerId, String scannerName) {
        this.scannerId = scannerId;
        this.scannerName = scannerName;
    }

    /**
     * Provide a value for the name of the issue
     *
     * @param name the name of the issue
     * @return ScanResultIssueBuilder with name value
     */
    public ScanResultIssueBuilder withName(String name) {
        this.name = name;
        return this;
    }

    /**
     * Provide a value for the type of issue
     *
     * @param type the type of issue
     * @return ScanResultIssueBuilder with type value
     */
    public ScanResultIssueBuilder withType(String type) {
        this.type = type;
        return this;
    }

    /**
     * Provide a value for the severity of the issue
     *
     * @param severity the severity of the issue
     * @return ScanResultIssueBuilder with severity value
     */
    public ScanResultIssueBuilder withSeverity(IssueSeverity severity) {
        this.severity = severity;
        return this;
    }

    /**
     * Provide a value for the description of the issue
     *
     * @param description the description of the issue
     * @return ScanResultIssueBuilder with description value
     */
    public ScanResultIssueBuilder withDescription(String description) {
        this.description = description;
        return this;
    }

    /**
     * Provide a value for if the issue is within the policy limits
     *
     * @param isCompliant is the issue within limits
     * @return ScanResultIssueBuilder with isCompliant value
     */
    public ScanResultIssueBuilder withIsCompliant(boolean isCompliant) {
        this.isCompliant = isCompliant;
        return this;
    }

    /**
     * Provide a value for if the issue can be fixed by m9sweeper
     *
     * @param isFixable can the issue be fixed
     * @return ScanResultIssueBuilder with isFixable value
     */
    public ScanResultIssueBuilder withIsFixable(boolean isFixable) {
        this.isFixable = isFixable;
        return this;
    }

    public ScanResultIssueBuilder withVulnerabilityDescUrl(String vulnerabilityDescUrl) {
        this.vulnerabilityDescUrl = vulnerabilityDescUrl;
        return this;
    }

    public ScanResultIssueBuilder withExtraData(String extraData) {
        this.extraData = extraData;
        return this;
    }

    /**
     * Build the ScanResultIssue object using options provided to the
     * ScanResultIssueBuilder
     *
     * @return the {@link ScanResultIssue}
     */
    public ScanResultIssue build() {
        ScanResultIssue issue = new ScanResultIssue();

        issue.setScannerId(this.scannerId);
        issue.setScannerName(this.scannerName);
        issue.setName(this.name);
        issue.setType(this.type);
        issue.setVulnerabilityDescUrl(this.vulnerabilityDescUrl);
        issue.setSeverity(this.severity);
        issue.setDescription(this.description);
        issue.setCompliant(this.isCompliant);
        issue.setFixable(this.isFixable);
        issue.setExtraData(this.extraData);

        return issue;
    }
}