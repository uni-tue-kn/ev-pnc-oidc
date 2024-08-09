# Create a build container
FROM golang:1.22-alpine AS build

# Update packages
RUN apk update && apk upgrade

# Copy source files
WORKDIR /go/src
COPY go/ ./go/
COPY main.go ./
COPY go.mod ./

# Set build commands
ENV CGO_ENABLED=0

# Install dependencies
RUN go get -d -v ./...

# Build the server
RUN go build -a -installsuffix cgo -o server .


# Create a runtime container
FROM alpine:3.20 AS runtime

# Update packages
RUN apk update && apk upgrade
# Install OpenSSL
RUN apk add openssl

# Create working directory /app
WORKDIR /app

# Copy server binary
COPY --from=build /go/src/server ./

# Copy config files
COPY ./config/ ./config
# Copy scripts
COPY ./scripts/ ./scripts

# Set default environment variables
ENV PORT=8080
# ENV TRUSTED_ISSUER=http://localhost:8080
# ENV TRUSTED_AUDIENCE=emsp_backend
# ENV REQUIRED_SCOPES=csr
ENV CSR_DIR=/app/csr
ENV CRT_DIR=/app/crt
ENV SIGNING_CMD=/app/scripts/sign-cert.sh
ENV SIGNING_ARGS="${CSR_FILE} ${CRT_FILE}"

# Expose port
EXPOSE ${PORT}/tcp

# Run server
ENTRYPOINT ["./scripts/entrypoint.sh"]
