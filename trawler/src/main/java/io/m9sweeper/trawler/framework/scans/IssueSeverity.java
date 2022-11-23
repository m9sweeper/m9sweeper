package io.m9sweeper.trawler.framework.scans;

/**
 * An enumerator for the possible severity an issue may be associated with. This is
 * used to unify the severity of an issue across scanners for policy making decisions.
 */
public enum IssueSeverity {

    // Define the possible levels and their associated string value
    UNKNOWN ("Unknown"),
    NEGLIGIBLE ("Negligible"),
    LOW ("Low"),
    MEDIUM ("Medium"),
    HIGH ("High"),
    CRITICAL ("Critical");

    // Local string representing the value of the enum
    private final String severityString;

    // Constructor for the enum to assign the enum its value
    IssueSeverity(String severityString) {
        this.severityString = severityString;
    }

    /**
     * Return the severity level value for the enumerator
     * @return severity level
     */
    @Override
    public String toString() {
        return this.severityString;
    }
}
