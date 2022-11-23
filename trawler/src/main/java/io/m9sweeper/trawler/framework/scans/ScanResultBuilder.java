package io.m9sweeper.trawler.framework.scans;

import io.m9sweeper.trawler.framework.docker.DockerImage;

import java.util.ArrayList;

/**
 * Provide a way to conveniently build a ScannerResult object without
 * using long constructors.
 */
public class ScanResultBuilder {
    private final DockerImage image;
    private long startedAt;
    private long finishedAt;
    private boolean encounteredError;
    private boolean isCompliant;
    private int numCriticalIssues;
    private int numHighIssues;
    private int numMediumIssues;
    private int numLowIssues;
    private int numNegligibleIssues;
    private Long policyId;
    private String summary;
    private String imageHash;


    private ArrayList<ScanResultIssue> issues;

    /**
     * Default constructor for the ScanResultBuilder which is used to
     * build ScanResult objects.
     *
     * @param image the DockerImage that was scanned
     * @see DockerImage
     */
    public ScanResultBuilder(DockerImage image) {
        this.image = image;
    }

    /**
     * Provide a value for the timestamp of when the scanner started the scan
     *
     * @param startedAt when the scan was started
     * @return ScanResultBuilder with startedAt value
     */
    public ScanResultBuilder withStartedAt(long startedAt) {
        this.startedAt = startedAt;
        return this;
    }

    /**
     * Provide a value for the timestamp of when the scanner finished the scan
     *
     * @param finishedAt when the scan was finished
     * @return ScanResultBuilder with finishedAt value
     */
    public ScanResultBuilder withFinishedAt(long finishedAt) {
        this.finishedAt = finishedAt;
        return this;
    }

    /**
     * Provide a value determining if the scan encountered an error or not
     *
     * @param encounteredError did the scan encounter an error
     * @return ScanResultBuilder with encounteredError value
     */
    public ScanResultBuilder withEncounteredError(boolean encounteredError) {
        this.encounteredError = encounteredError;
        return this;
    }

    /**
     * Provide a value determining if the scan is compliant with the policies or not
     *
     * @param isCompliant is the scan complaint
     * @return ScanResultBuilder with isCompliant value
     */
    public ScanResultBuilder withIsCompliant(boolean isCompliant) {
        this.isCompliant = isCompliant;
        return this;
    }

    /**
     * Provide a value for the number of critical issues a scan produced
     *
     * @param numCriticalIssues the number of critical issues
     * @return ScanResultBuilder with numCriticalIssues value
     */
    public ScanResultBuilder withNumCriticalIssues(int numCriticalIssues) {
        this.numCriticalIssues = numCriticalIssues;
        return this;
    }

    /**
     * Provide a value for the number of high issues a scan produced
     *
     * @param numHighIssues the number of high issues
     * @return ScanResultBuilder with numHighIssues value
     */
    public ScanResultBuilder withNumHighIssues(int numHighIssues) {
        this.numHighIssues = numHighIssues;
        return this;
    }

    /**
     * Provide a value for the number of medium issues a scan produced
     *
     * @param numMediumIssues the number of medium issues
     * @return ScanResultBuilder with numMediumIssues value
     */
    public ScanResultBuilder withNumMediumIssues(int numMediumIssues) {
        this.numMediumIssues = numMediumIssues;
        return this;
    }

    /**
     * Provide a value for the number of low issues a scan produced
     *
     * @param numLowIssues the number of low issues
     * @return ScanResultBuilder with numLowIssues value
     */
    public ScanResultBuilder withNumLowIssues(int numLowIssues) {
        this.numLowIssues = numLowIssues;
        return this;
    }

    /**
     * Provide a value for the number of negligible issues a scan produced
     *
     * @param numNegligibleIssues the number of negligible issues
     * @return ScanResultBuilder with numNegligibleIssues value
     */
    public ScanResultBuilder withNumNegligibleIssues(int numNegligibleIssues) {
        this.numNegligibleIssues = numNegligibleIssues;
        return this;
    }

    /**
     * Provide a list of ScanResultIssues that the scan produced
     *
     * @param issues list of ScanResultIssue objects
     * @return ScanResultBuilder with issues value
     * @see ScanResultIssue
     */
    public ScanResultBuilder withIssues(ArrayList<ScanResultIssue> issues) {
        this.issues = issues;
        return this;
    }

    public ScanResultBuilder withPolicy(Long policyId) {
        this.policyId = policyId;
        return this;
    }

    public ScanResultBuilder withSummary(String summary) {
        this.summary = summary;
        return this;
    }

    /**
     * Provide a new image hash to update on the database
     *
     * @param hash the new image hash
     * @return ScanResultBuilder with imageHash value
     */
    public ScanResultBuilder withHash(String hash) {
        this.imageHash = hash;
        return this;
    }

    /**
     * Build the ScanResult object using options provided to the ScanResultBuilder
     *
     * @return the ScanResult
     */
    public ScanResult build() {
        ScanResult result = new ScanResult();

        result.setImage(this.image);
        result.setStartedAt(this.startedAt);
        result.setFinishedAt(this.finishedAt);
        result.setEncounteredError(this.encounteredError);
        result.setCompliant(this.isCompliant);
        result.setNumCriticalIssues(this.numCriticalIssues);
        result.setNumHighIssues(this.numHighIssues);
        result.setNumMediumIssues(this.numMediumIssues);
        result.setNumLowIssues(this.numLowIssues);
        result.setNumNegligibleIssues(this.numNegligibleIssues);
        result.setIssues(this.issues);
        result.setPolicyId(this.policyId);
        result.setSummary(this.summary);
        result.setImageHash(this.imageHash);

        return result;
    }
}
