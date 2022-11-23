package io.m9sweeper.trawler.framework.policies;

import java.util.ArrayList;

/**
 * Provided a way to conveniently build a Policy object without using long constructors
 */
public class PolicyBuilder {
    private final int id;
    private String name;
    private boolean isEnforced;
    private ArrayList<String> scanners;

    /**
     * Default constructor for the PolicyBuilder which is used to build Policy objects.
     *
     * @param id the ID of the policy
     */
    public PolicyBuilder(int id) {
        this.id = id;
    }

    /**
     * Provide a value for the name of the policy
     *
     * @param name the name of the policy
     * @return PolicyBuilder with name value
     */
    public PolicyBuilder withName(String name) {
        this.name = name;
        return this;
    }

    /**
     * Provide a value for if the policy should be enforced
     *
     * @param isEnforced id the policy enforced
     * @return PolicyBuilder with isEnforced value
     */
    public PolicyBuilder withIsEnforced(boolean isEnforced) {
        this.isEnforced = isEnforced;
        return this;
    }

    /**
     * Provide a value for the list of scanners the policy uses
     *
     * @param scanners the list of scanners for the policy
     * @return PolicyBuilder with scanners value
     */
    public PolicyBuilder withScanners(ArrayList<String> scanners) {
        this.scanners = scanners;
        return this;
    }

    /**
     * Build the Policy object using options provided to the PolicyBuilder
     *
     * @return the Policy
     */
    public Policy build() {
        Policy policy = new Policy();

        policy.setId(this.id);
        policy.setName(this.name);
        policy.setEnforced(this.isEnforced);
        policy.setScanners(this.scanners);

        return policy;
    }
}
