package io.m9sweeper.trawler.framework.queue;

import com.fasterxml.jackson.annotation.*;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "id",
        "name",
        "hostname",
        "aliases",
        "loginRequired",
        "username",
        "password",
        "authType",
        "authDetails",
})
public class Registry {

    @JsonProperty("id")
    private Long id;
    @JsonProperty("name")
    private String name;
    @JsonProperty("hostname")
    private String hostname;
    @JsonProperty("aliases")
    private List<String> aliases;
    @JsonProperty("loginRequired")
    private Boolean loginRequired;
    @JsonProperty("username")
    private String username;
    @JsonProperty("password")
    private String password;
    @JsonProperty("authType")
    private String authType;
    @JsonProperty("authDetails")
    private Object authDetails;

    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("id")
    public Long getId() {
        return id;
    }

    @JsonProperty("id")
    public void setId(Long id) {
        this.id = id;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    @JsonProperty("hostname")
    public String getHostname() {
        return hostname;
    }

    @JsonProperty("hostname")
    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    @JsonProperty("aliases")
    public List<String> getAliases() {
        return this.aliases;
    }
    @JsonProperty("aliases")
    public void setAliases(List<String> aliases) {
        this.aliases = aliases;
    }

    @JsonProperty("loginRequired")
    public Boolean getLoginRequired() {
        return loginRequired;
    }

    @JsonProperty("loginRequired")
    public void setLoginRequired(Boolean loginRequired) {
        this.loginRequired = loginRequired;
    }

    @JsonProperty("username")
    public String getUsername() {
        return username;
    }

    @JsonProperty("username")
    public void setUsername(String username) {
        this.username = username;
    }

    @JsonProperty("password")
    public String getPassword() {
        return password;
    }

    @JsonProperty("password")
    public void setPassword(String password) {
        this.password = password;
    }

    @JsonProperty("authType")
    public String getAuthType() {
        return authType;
    }

    @JsonProperty("authType")
    public void setAuthType(String authType) {
        this.authType = authType;
    }

    @JsonProperty("authDetails")
    public Object getAuthDetails() {
        return authDetails;
    }

    @JsonProperty("authDetails")
    public void setAuthDetails(Object authDetails) {
        this.authDetails = authDetails;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("id", id)
                .append("name", name)
                .append("hostname", hostname)
                .append("aliases", aliases)
                .append("loginRequired", loginRequired)
                .append("username", username)
                .append("password", password)
                .append( "authType", authType)
                .append("authDetails", authDetails)
                .append("additionalProperties", additionalProperties)
                .toString();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
                .append(hostname)
                .append(aliases)
                .append(password)
                .append(name)
                .append(id)
                .append(additionalProperties)
                .append(loginRequired)
                .append(username)
                .append(authType)
                .append(authDetails)
                .toHashCode();
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Registry) == false) {
            return false;
        }
        Registry rhs = ((Registry) other);
        return new EqualsBuilder()
                .append(hostname, rhs.hostname)
                .append(aliases, rhs.aliases)
                .append(password, rhs.password)
                .append(name, rhs.name)
                .append(id, rhs.id)
                .append(additionalProperties, rhs.additionalProperties)
                .append(loginRequired, rhs.loginRequired)
                .append(username, rhs.username)
                .append(authType, rhs.authType)
                .append(authDetails, rhs.authDetails)
                .isEquals();
    }
}
