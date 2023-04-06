# Build stage-1 - compile Java Code into native executable
FROM ghcr.io/graalvm/graalvm-ce:ol8-java17-22.3.1 as builder

RUN gu install native-image && java -version

WORKDIR /usr/app
COPY ./ /usr/app

RUN chmod +x mvnw && ./mvnw -version
RUN ./mvnw -Pnative package

RUN find /usr/app

# Build stage 2 -
FROM debian:buster-slim as runner

# Install Trivy
RUN apt-get update && apt-get install -y wget procps
RUN wget -O - https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.39.0

# Install
COPY --from=0 /usr/app/target/trawler /usr/local/bin/trawler

# Create non root user
RUN groupadd -g 1050 trawler && \
    useradd -u 1050 trawler -g trawler -m

# Set non root user
USER 1050
CMD ["trawler"]
