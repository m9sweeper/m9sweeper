# Build stage-1 - compile Java Code into native executable
FROM ghcr.io/graalvm/graalvm-ce:ol9-java17-22.3.3 as builder

RUN gu install native-image && java -version

WORKDIR /usr/app
COPY ./ /usr/app

RUN chmod +x mvnw && ./mvnw -version
RUN ./mvnw -Pnative package

RUN find /usr/app

# Build stage 2 -
FROM debian:bookworm-slim as runner

# Install Trivy
RUN apt-get update && apt-get install -y wget procps
RUN wget -O - https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v0.43.1
RUN wget -0 - https://static.snyk.io/cli/latest/snyk-alpine | sh -s -- -b /usr/local/bin snyk
RUN cat /usr/local/bin
RUN chmod +x snyk-alpine && mv snyk-alpine /usr/local/bin/

# Install
COPY --from=0 /usr/app/target/trawler /usr/local/bin/trawler

# Create non root user
RUN groupadd -g 1050 trawler && \
    useradd -u 1050 trawler -g trawler -m

# Set non root user
USER 1050
CMD ["trawler"]
