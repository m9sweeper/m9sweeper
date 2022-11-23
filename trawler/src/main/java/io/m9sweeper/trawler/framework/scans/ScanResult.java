package io.m9sweeper.trawler.framework.scans;

import io.m9sweeper.trawler.framework.docker.DockerImage;

import java.util.ArrayList;

/**
 * This class is used in plugins to create a standard format for
 * returning scan results back to m9sweeper.
 */
public class ScanResult {
    // The docker image that was scanned as stored in the m9sweeper database
    private DockerImage image;

    // Timestamp of when the scan was started
    private long startedAt;

    // Timestamp of when the scan was finished
    private long finishedAt;

    // Was there an error during the scan
    private boolean encounteredError;

    // Is the image compliant
    private boolean isCompliant;

    // Total number of critical level issues
    private int numCriticalIssues;

    // Total number of high level issues
    private int numHighIssues;

    // Total number of medium level issues
    private int numMediumIssues;

    // Total number of low level issues
    private int numLowIssues;

    // Total number of negligible issues
    private int numNegligibleIssues;

    private Long policyId;

    // Array of all the issues found
    private ArrayList<ScanResultIssue> issues = new ArrayList<>();


    private String summary;

    // New hash value of an image if it needs updating
    private String imageHash;


    /**
     * Get the DockerImage that was scanned
     *
     * @return the DockerImage that was scanned
     * @see DockerImage
     */
    public DockerImage getImage() {
        return image;
    }

    /**
     * Set the DockerImage that was scanned
     *
     * @param image the DockerImage that was scanned
     * @see DockerImage
     */
    public void setImage(DockerImage image) {
        this.image = image;
    }

    /**
     * Get the timestamp for when the scan was started
     *
     * @return the timestamp of when the scan started
     */
    public long getStartedAt() {
        return startedAt;
    }

    /**
     * Set the timestamp for when the scan was started
     *
     * @param startedAt the timestamp of when the scan was started
     */
    public void setStartedAt(long startedAt) {
        this.startedAt = startedAt;
    }

    /**
     * Get the timestamp for when the scan was finished
     *
     * @return the timestamp of when the scan finished
     */
    public long getFinishedAt() {
        return finishedAt;
    }

    /**
     * Set the timestamp for when the scan was finished
     *
     * @param finishedAt the timestamp of when the scan was finished
     */
    public void setFinishedAt(long finishedAt) {
        this.finishedAt = finishedAt;
    }

    /**
     * Get if the scan encountered an error
     *
     * @return did the scan encounter an error
     */
    public boolean isEncounteredError() {
        return encounteredError;
    }

    /**
     * Set if the scan encountered an error
     *
     * @param encounteredError did the scan encounter an error
     */
    public void setEncounteredError(boolean encounteredError) {
        this.encounteredError = encounteredError;
    }

    /**
     * Get if the scan was compliant with the policy
     *
     * @return was the scan compliant
     */
    public boolean isCompliant() {
        return isCompliant;
    }

    /**
     * Set if the scan was compliant with the policy
     *
     * @param compliant was the scan compliant
     */
    public void setCompliant(boolean compliant) {
        isCompliant = compliant;
    }

    /**
     * Get the number of critical issues the scan produced
     *
     * @return the number of critical issues
     */
    public int getNumCriticalIssues() {
        return numCriticalIssues;
    }

    /**
     * Set the number of critical issues the scan produced
     *
     * @param numCriticalIssues the number of critical issues
     */
    public void setNumCriticalIssues(int numCriticalIssues) {
        this.numCriticalIssues = numCriticalIssues;
    }

    /**
     * Get the number of high issues the scan produced
     *
     * @return the number of high issues
     */
    public int getNumHighIssues() {
        return numHighIssues;
    }

    /**
     * Set the number of high issues the scan produced
     *
     * @param numHighIssues the number of high issues
     */
    public void setNumHighIssues(int numHighIssues) {
        this.numHighIssues = numHighIssues;
    }

    /**
     * Get the number of medium issues the scan produced
     *
     * @return the number of medium issues
     */
    public int getNumMediumIssues() {
        return numMediumIssues;
    }

    /**
     * Set the number of medium issues the scan produced
     *
     * @param numMediumIssues the number of medium issues
     */
    public void setNumMediumIssues(int numMediumIssues) {
        this.numMediumIssues = numMediumIssues;
    }

    /**
     * Get the number of low issues the scan produced
     *
     * @return the number of medium issues
     */
    public int getNumLowIssues() {
        return numLowIssues;
    }

    /**
     * Set the number of low issues a scan produced
     *
     * @param numLowIssues the number of low issues
     */
    public void setNumLowIssues(int numLowIssues) {
        this.numLowIssues = numLowIssues;
    }

    /**
     * Get the number of negligible issues the scan produced
     *
     * @return the number of negligible issues
     */
    public int getNumNegligibleIssues() {
        return numNegligibleIssues;
    }

    /**
     * Set the number of negligible issues the scan produced
     *
     * @param numNegligibleIssues the number of negligible issues
     */
    public void setNumNegligibleIssues(int numNegligibleIssues) {
        this.numNegligibleIssues = numNegligibleIssues;
    }

    /**
     * Get the list of ScanResultIssues the scan produced
     *
     * @return the list of ScanResultIssues
     * @see ScanResultIssue
     */
    public ArrayList<ScanResultIssue> getIssues() {
        return issues;
    }

    /**
     * Set the list of ScanResultIssues the scan produced
     *
     * @param issues the list of ScanResultIssues
     * @see ScanResultIssue
     */
    public void setIssues(ArrayList<ScanResultIssue> issues) {
        this.issues = issues;
    }

    /**
     * Add a ScanResultIssue to the list of issues the scan produced
     *
     * @param issue the ScanResultIssue to add
     * @see ScanResultIssue
     */
    public void addIssue(ScanResultIssue issue) {
        this.issues.add(issue);
    }

    /**
     * Remove a ScanResultIssue from the list of issues the scan produced
     *
     * @param issue the ScanResultIssue to remove
     * @see ScanResultIssue
     */
    public void removeIssue(ScanResultIssue issue) {
        this.issues.remove(issue);
    }

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    /**
     * Get the image hash of the scanned image, if it was found to be
     * different than the hash currently stored on the database
     *
     * @return the new hash of a scanned image
     */
    public String getImageHash() { return imageHash; }

    /**
     * Set the new image hash the scan discovered
     *
     * @param hash the new hash of the scanned image
     */
    public void setImageHash(String hash) { this.imageHash = hash; }

    @Override
    public String toString() {
        return "ScanResult{" +
                "image=" + image +
                ", startedAt='" + startedAt + '\'' +
                ", finishedAt='" + finishedAt + '\'' +
                ", encounteredError=" + encounteredError +
                ", isCompliant=" + isCompliant +
                ", numCriticalIssues=" + numCriticalIssues +
                ", numHighIssues=" + numHighIssues +
                ", numMediumIssues=" + numMediumIssues +
                ", numLowIssues=" + numLowIssues +
                ", numNegligibleIssues=" + numNegligibleIssues +
                ", policyId=" + policyId +
                ", issues=" + issues +
                ", summary=" + summary +
                ", hash=" + imageHash +
                '}';
    }
}