package io.m9sweeper.trawler.framework.docker;

import java.util.ArrayList;
import java.util.List;

/**
 * Provides a way to conveniently build a DockerRegistry object without
 * using long constructors
 */
public class DockerRegistryBuilder {
    private String name;
    private final String hostname;
    private final Boolean isLoginRequired;
    private List<String> aliases = new ArrayList<String>();
    private String email = "";
    private String username = "";
    private String password = "";
    private final String authtype;
    private final Object authDetails;

    /**
     * Default constructor for the DockerRegistryBuilder which is used to build DockerRegistry objects
     *
     * @param hostname the hostname of the DockerRegistry
     * @param isLoginRequired is login required to access this registry
     * @param authtype
     * @paran authDetails
     */
    public DockerRegistryBuilder(String hostname, boolean isLoginRequired, String authtype, Object authDetails) {
        this.hostname = hostname;
        this.isLoginRequired = isLoginRequired;
        this.authtype = authtype;
        this.authDetails = authDetails;
    }

    public DockerRegistryBuilder withAliases(List<String> aliases) {
        this.aliases = aliases;
        return this;
    }

    /**
     * Provide a value for the name of the DockerRegistry
     *
     * @param name the name of the registry
     * @return DockerRegistryBuilder with name value
     */
    public DockerRegistryBuilder withName(String name) {
        this.name = name;
        return this;
    }

    /**
     * Provide a value for the email of the DockerRegistry
     *
     * @param email the email for the registry
     * @return DockerRegistryBuilder with email value
     */
    public DockerRegistryBuilder withEmail(String email) {
        this.email = email;
        return this;
    }

    /**
     * Provide a value for the username of the DockerRegistry
     *
     * @param username the username for the registry
     * @return DockerRegistryBuilder with username value
     */
    public DockerRegistryBuilder withUsername(String username) {
        this.username = username;
        return this;
    }

    /**
     * Provide a value for the password of the DockerRegistry
     *
     * @param password the password for the registry
     * @return DockerRegistryBuilder with password value
     */
    public DockerRegistryBuilder withPassword(String password) {
        this.password = password;
        return this;
    }
    /**
     * Build the DockerRegistry object using the values provided to the DockerRegistryBuilder
     * @return the DockerRegistry
     */
    public DockerRegistry build() {
        DockerRegistry registry = new DockerRegistry();

        registry.setName(this.name);
        registry.setHostname(this.hostname);
        registry.setAliases(this.aliases);
        registry.setIsLoginRequired(this.isLoginRequired);
        registry.setEmail(this.email);
        registry.setUsername(this.username);
        registry.setPassword(this.password);
        registry.setAuthType(this.authtype);
        registry.setAuthDetails(this.authDetails);

        return registry;
    }
}
