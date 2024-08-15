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
FROM alpine AS runtime

# Update packages
RUN apk update && apk upgrade
# Install OpenSSL
RUN apk add openssl ca-certificates
# Update certificates
RUN update-ca-certificates

# Create working directory /app
WORKDIR /app

# Copy built server
COPY --from=build /go/src/server ./server

# Copy config files
COPY ./example-config/ ./config
# Copy scripts
COPY ./scripts/ ./scripts
RUN chmod 750 ./scripts/csr.sh
# Copy CSR configuration
COPY ./csr.conf ./csr.conf

# Create default output directory.
RUN mkdir ./output

# Set default environment variables
ENV PORT=8080
ENV CSR_ENDPOINT=http://emsp.localhost
ENV OUTPUT_FILE=./output/cc.cer

# Expose port
EXPOSE ${PORT}/tcp

# Run server
ENTRYPOINT ["./server"]
