# Build container
FROM golang:1.21 AS build

# Update packages
RUN apt update && apt upgrade -y

# Copy source files
WORKDIR /go/src
COPY go/ ./go
COPY main.go .
COPY go.mod .

# Set build commands
ENV CGO_ENABLED=0

# Install dependencies
RUN go get -d -v ./...

# Build the server
RUN go build -a -installsuffix cgo -o server .


# Runtime container
FROM alpine AS runtime

# Update packages and install openssl
RUN apk upgrade --update-cache --available && apk add openssl

# Create app directory and copy required executable and config files
WORKDIR /app
COPY --from=build /go/src/server .
COPY ./config/ ./config
COPY ./scripts/ ./scripts

# Set default environment variables
ENV PORT=8080
ENV TRUSTED_ISSUER=http://localhost:8080
ENV TRUSTED_AUDIENCE=emsp_backend
ENV REQUIRED_SCOPES=csr
ENV CSR_DIR=./csr
ENV CRT_DIR=./crt
ENV SIGNING_CMD=./sign-cert.sh
ENV SIGNING_ARGS="${CSR_FILE} ${CRT_FILE}"

# Expose port
EXPOSE ${PORT}/tcp

# Run server
ENTRYPOINT ["./scripts/entrypoint.sh"]
