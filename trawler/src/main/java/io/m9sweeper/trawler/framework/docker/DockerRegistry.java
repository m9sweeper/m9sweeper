package io.m9sweeper.trawler.framework.docker;

import java.util.List;

/**
 * This class is used to manage the docker registries that are used for images
 */
public class DockerRegistry {
    // The name of the registry
    private String name;

    // The address of the registry
    private String hostname;

    private List<String> aliases;

    // Is login is required to access the registry
    private Boolean isLoginRequired;

    // The email for the registry
    private String email;

    // The username for the registry
    private String username;

    // The password for the registry
    private String password;

    // auth type for the registry
    private String authType;

    // auth detail for the registry
    private Object authDetails;

    /**
     * Get the name of the registry
     *
     * @return the name of the registry
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the registry
     *
     * @param name the name of the registry
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the hostname of the registry
     *
     * @return the hostname of the registry
     */
    public String getHostname() {
        return hostname;
    }

    /**
     * Set the hostname of the registry
     *
     * @param hostname the hostname of the registry
     */
    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    /**
     * Get if login is required to access the registry
     *
     * @return is login required for access
     */

    public List<String> getAliases() {
        return this.aliases;
    }

    public void setAliases(List<String> aliases) {
        this.aliases = aliases;
    }
    public Boolean getIsLoginRequired() {
        return isLoginRequired;
    }

    /**
     * Set if login is required to access the registry
     *
     * @param isLoginRequired is login required to access the registry
     */
    public void setIsLoginRequired(Boolean isLoginRequired) {
        this.isLoginRequired = isLoginRequired;
    }

    /**
     * Get the email for the registry
     *
     * @return the email for the registry
     */
    public String getEmail() {
        return email;
    }

    /**
     * Set the email for the registry
     *
     * @param email the email for the registry
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Get the username for the registry
     *
     * @return the username for the registry
     */
    public String getUsername() {
        return username;
    }

    /**
     * Set the username for the registry
     *
     * @param username the username for the registry
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Get the password for the registry
     *
     * @return the password for the registry
     */
    public String getPassword() {
        return password;
    }

    /**
     * Set the password for the registry
     *
     * @param password the password for the registry
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Get auth type for the registry
     *
     * @return the authType for the registry
     */
    public String getAuthType() { return authType; }

    /**
     * Set the authType for the registry
     *
     * @param authType the authType for the registry
     */
    public void setAuthType(String authType) {
        this.authType = authType;
    }

    /**
     * Get authDetails for the registry
     *
     * @return authDetails for the registry
     */
    public Object getAuthDetails() { return authDetails; }

    /**
     * Set the authDetails for the registry
     *
     * @param authDetails the authDetails for the registry
     */
    public void setAuthDetails(Object authDetails) {
        this.authDetails = authDetails;
    }

    @Override
    public String toString() {
        return "DockerRegistry{" +
                "name='" + name + '\'' +
                ", hostname='" + hostname + '\'' +
                ", aliases='" + aliases + '\'' +
                ", isLoginRequired=" + isLoginRequired +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", authType='" + authType + '\'' +
                ", authDetails='" + authDetails + '\'' +
                '}';
    }
}
