package io.m9sweeper.trawler.framework.docker;

/**
 * This class is used to manage the docker image that is being scanned
 */
public class DockerImage {
    // The ID of the docker image in the m9sweeper API
    private int id;

    // The name of the docker image
    private String name;

    // The tag of the docker image
    private String tag;

    // The hash of the image
    private String hash;

    // The DockerRegistry the image is in
    private DockerRegistry registry;


    /**
     * Get the ID of the docker image in the m9sweeper API
     *
     * @return the ID of the image
     */
    public int getId() {
        return id;
    }

    /**
     * Set the ID of the docker image. This should be set to what is in
     * the m9sweeper API database.
     *
     * @param id the ID of the image
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Get the name of the docker image
     *
     * @return the name of the image
     */
    public String getName() {
        return name;
    }

    /**
     * Set the name of the docker image
     *
     * @param name the name of the image
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Builds the full path that can be used in a Docker pull command
     * @param includeRegistry Whether it should include the registry prefix
     * @param includeHash Whether it should include the sha. Will not include the sha if it is null or starts with TMP_ regardless of the value
     * @return the full path of the docker image
     */
    public String buildFullPath(boolean includeRegistry, boolean includeHash) {
        StringBuilder builder = new StringBuilder(32);
        if (includeRegistry) {
            builder.append(this.registry.getHostname())
                    .append('/');
        }

        builder.append(this.name)
                .append(":")
                .append(this.tag);

        if (includeHash && !this.hasTempHash()) {
            builder.append("@sha256:")
                    .append(this.hash);
        }

        return builder.toString();
    }

    /**
     * Checks if the hash is temporary (starts with 'TMP_') or null.
     */
    public boolean hasTempHash() {
        return this.hash == null || this.hash.startsWith("TMP_");
    }

    /**
     * Get the tag of the docker image
     *
     * @return the tag of the image
     */
    public String getTag() {
        return tag;
    }

    /**
     * Set the tag of the docker image
     *
     * @param tag the tag of the image
     */
    public void setTag(String tag) {
        this.tag = tag;
    }

    /**
     * Get the hash of the docker image
     *
     * @return the hash of the image
     */
    public String getHash() {
        return hash;
    }

    /**
     * Set the hash of the docker image
     *
     * @param hash the hash of the image
     */
    public void setHash(String hash) {
        this.hash = hash;
    }

    /**
     * Get the DockerRegistry the docker image is in
     *
     * @return the docker image's docker registry
     */
    public DockerRegistry getRegistry() {
        return registry;
    }

    /**
     * Set the DockerRegistry the docker image is in
     *
     * @param registry the docker image's docker registry
     */
    public void setRegistry(DockerRegistry registry) {
        this.registry = registry;
    }

    @Override
    public String toString() {
        return "DockerImage{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", tag='" + tag + '\'' +
                ", hash='" + hash + '\'' +
                ", registry=" + registry +
                '}';
    }
}

