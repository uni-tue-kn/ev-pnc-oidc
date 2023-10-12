# Build container
FROM golang:1.21 AS build

# Update and install packages
RUN apt update && apt upgrade -y

# Copy source files
WORKDIR /go/src
COPY go ./go
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
RUN apk upgrade --update-cache --available && apk add openssl ca-certificates

# Create app directory and copy required executable files
WORKDIR /app
COPY --from=build /go/src/server .
COPY ./scripts/ ./scripts

# Set default environment variables
ENV PORT=8080
ENV SERVICE_API_KEY="YOUR_SERVICE_API_KEY"
ENV SERVICE_API_SECRET="YOUR_SERVICE_API_SECRET"
ENV SERVICE_API_KEY_FILE=""
ENV SERVICE_API_SECRET_FILE=""
ENV KEYS_DIR="./keys"
ENV USER_CREDS="./config/users.json"

# Expose port
EXPOSE ${PORT}/tcp

# Run server
ENTRYPOINT ["./scripts/entrypoint.sh"]
