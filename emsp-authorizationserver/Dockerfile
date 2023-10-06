FROM maven:3.8.5-openjdk-8

# Update packages
RUN apt update && apt upgrade -y

# Copy source files
WORKDIR /app
COPY . .

RUN mvn -s /usr/share/maven/ref/settings-docker.xml clean install && \
    # Import the root certificate of Open Banking Brasil Sandbox
    certs/import-certificate.sh certs/Open_Banking_Brasil_Sandbox_Root_G1.pem

# Set default environment variables
ENV PORT=8080

# Expose port
EXPOSE ${PORT}/tcp

# Run server
ENTRYPOINT ["mvn", "-s", "/usr/share/maven/ref/settings-docker.xml", "clean", "jetty:run"]
