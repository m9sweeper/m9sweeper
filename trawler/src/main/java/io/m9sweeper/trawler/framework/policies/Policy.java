package io.m9sweeper.trawler.framework.policies;

import java.util.ArrayList;

/**
 * This class provides an object for mapping policies too
 */
public class Policy {
    // The ID of the policy
    private int id;

    // The name of the policy
    private String name;

    // If the policy should be enforced
    private boolean isEnforced;

    // The scanners this policy uses
    private ArrayList<String> scanners;


    /**
     * Get the ID of the policy
     *
     * @return the ID of the policy
     */
    public int getId() {
        return id;
    }

    /**
     * Set the ID of the policy
     *
     * @param id the ID of the policy
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Get the name of the policy
     *
     * @return the name of the policy
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the policy
     *
     * @param name the name of the policy
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get if the policy is enforced
     *
     * @return is the policy enforced
     */
    public boolean isEnforced() {
        return isEnforced;
    }

    /**
     * Set if the policy is enforced
     *
     * @param enforced is the policy enforced
     */
    public void setEnforced(boolean enforced) {
        isEnforced = enforced;
    }

    /**
     * Get the list of scanners to use for this policy
     *
     * @return the list of scanners
     */
    public ArrayList<String> getScanners() {
        return scanners;
    }

    /**
     * Set the list of scanners to use for this policy
     *
     * @param scanners the list of scanners
     */
    public void setScanners(ArrayList<String> scanners) {
        this.scanners = scanners;
    }
}