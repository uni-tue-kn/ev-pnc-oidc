# EV Backend

The backend HTTP server running on the EV and being accessible through the Bluetooth HTTP Proxy.


## Documentation

### REST API

The OpenAPI specification is provided [here](./api/swagger.yaml).
Use [Swagger Editor](https://editor.swagger.io/) to display it.


### Configuration

The EV Backend can be configured with the following environment variables:

**CSR Endpoint `CSR_ENDPOINT`**
  A URL to the Certificate Signing Request (CSR) Endpoint.
  Default is `http://emsp.localhost`.

**Output File `OUTPUT_FILE`**
  The file path where to write the Contract Certificate to.
  Default is `./output/cc.cer`.


#### Configure eMSPs

Available eMSPs can be configured by editing the `./config/emsp.json` and the `./config/emsp_secrets.json` file.
**Make sure that the emsp_secrets.json file maps from an eMSP's `id` to its OAuth client secret!**


### Requirements

- Server requires connection to the 


## Development

Go commands:

```bash
# Load packages
go get

# Start server. Will be available on http://localhost:8080
go run ./main.go

# Builds the server with all its dependencies to the single binary "server"
go build -a -installsuffix cgo -o server .
```

Docker commands:

```bash
# Build the container as "ev-backend:latest" image
docker build --pull --rm -f "Dockerfile" -t ev-backend:latest "./"

# Run the built container. Server will be available on http://localhost:8080 and store certificate to ./output/cc.cer
docker run -p "8080:8080" -v "./output:/app/output" ev-backend:latest
```
