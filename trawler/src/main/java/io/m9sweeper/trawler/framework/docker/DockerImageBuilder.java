package io.m9sweeper.trawler.framework.docker;

/**
 * Provide a way to conveniently build a DockerImage object without
 * using long constructors.
 */
public class DockerImageBuilder {
    private final int id;
    private String name;
    private String tag;
    private String hash;
    private DockerRegistry registry;

    /**
     * Default constructor for the DockerImageBuilder which is used to
     * build DockerImage objects.
     *
     * @param id the ID of the docker image in the m9sweeper API
     */
    public DockerImageBuilder(int id) {
        this.id = id;
    }

    /**
     * Provide a value for the name of the docker image
     *
     * @param name the name of the docker image
     * @return DockerImageBuilder with name value
     */
    public DockerImageBuilder withName(String name) {
        this.name = name;
        return this;
    }

    /**
     * Provide a value for the tag of the docker image
     *
     * @param tag the tag of the docker image
     * @return DockerImageBuilder with tag value
     */
    public DockerImageBuilder withTag(String tag) {
        this.tag = tag;
        return this;
    }

    /**
     * Provide a value for the hash of the docker image
     *
     * @param hash the hash of the docker image
     * @return DockerImageBuilder with hash value
     */
    public DockerImageBuilder withHash(String hash) {
        this.hash = hash;
        return this;
    }

    /**
     * Provide a value for the registry the docker image is located in
     *
     * @param registry the image docker registry
     * @return DockerImageBuilder with registry value
     */
    public DockerImageBuilder withRegistry(DockerRegistry registry) {
        this.registry = registry;
        return this;
    }

    /**
     * Build the DockerImage object using the options provided to the DockerImageBuilder
     *
     * @return the DockerImage
     */
    public DockerImage build() {
        DockerImage image = new DockerImage();

        image.setId(this.id);
        image.setName(this.name);
        image.setTag(this.tag);
        image.setHash(this.hash);
        image.setRegistry(this.registry);

        return image;
    }
}