package io.m9sweeper.trawler.framework.queue;

import com.fasterxml.jackson.annotation.*;
import org.apache.commons.lang.builder.EqualsBuilder;
import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.builder.ToStringBuilder;

import java.util.HashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "image",
        "cluster",
        "dockerRegistry"
})
public class Message {

    @JsonProperty("image")
    private Image image;
    @JsonProperty("cluster")
    private Cluster cluster;
    @JsonProperty("dockerRegistry")
    private Registry registry;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("image")
    public Image getImage() {
        return image;
    }

    @JsonProperty("image")
    public void setImage(Image image) {
        this.image = image;
    }

    @JsonProperty("cluster")
    public Cluster getCluster() {
        return cluster;
    }

    @JsonProperty("cluster")
    public void setCluster(Cluster cluster) {
        this.cluster = cluster;
    }

    @JsonProperty("dockerRegistry")
    public Registry getRegistry() {
        return registry;
    }

    @JsonProperty("dockerRegistry")
    public void setRegistry(Registry registry) {
        this.registry = registry;
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
        return new ToStringBuilder(this).append("image", image).append("cluster", cluster).append("dockerRegistry", registry).append("additionalProperties", additionalProperties).toString();
    }

    @Override
    public int hashCode() {
        return new HashCodeBuilder().append(registry).append(image).append(cluster).append(additionalProperties).toHashCode();
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Message) == false) {
            return false;
        }
        Message rhs = ((Message) other);
        return new EqualsBuilder().append(registry, rhs.registry).append(image, rhs.image).append(cluster, rhs.cluster).append(additionalProperties, rhs.additionalProperties).isEquals();
    }

}