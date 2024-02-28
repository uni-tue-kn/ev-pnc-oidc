# EV Backend

The backend HTTP server running on the EV and being accessible through the Bluetooth HTTP Proxy.


## 1. Documentation

### 1.1. REST API

The OpenAPI specification is provided [here](./api/swagger.yaml).
Use [Swagger Editor](https://editor.swagger.io/) to display it.


### 1.2. Configuration

The EV Backend can be configured with the following environment variables:

**CSR Endpoint `CSR_ENDPOINT`**
  A URL to the Certificate Signing Request (CSR) Endpoint.
  Default is `http://emsp.localhost`.

**Output File `OUTPUT_FILE`**
  The file path where to write the Contract Certificate to.
  Default is `./output/cc.cer`.


#### 1.2.1. eMSP Configuration

Available eMSPs can be configured by creating and editing the following three files:

- `./config/emsp.json`: The [public eMSP Authorization Server configuration](#1211-public-emsp-authorization-server-configuration).
- `./config/emsp_creds.json`: The [secret eMSP Authorization Server configuration](#1212-secret-emsp-authorization-server-configuration).
- `./config/emsp_resource_ep.json`: The eMSP Backend Server configuration.

**Warning: The `./config` directory's is excluded from versioning because it may contain secrets!**
You can use the configuration examples provided in [`example-config`](./example-config/) and adjust them to your environment.

 `./config/emsp.json` and the `./config/emsp_secrets.json` file.
**Make sure that the emsp_secrets.json file maps from an eMSP's `id` to its OAuth client secret!**

The files are described in the following sections.


##### 1.2.1.1. Public eMSP Authorization Server Configuration

- File: `config/emsp.json`
- Example File: [`config-example/emsp.json`](./example-config/emsp.json)

**Example:**
```json
[
  {
    "id": "sample_emsp",                  // The eMSP ID.
    "name": "Example eMSP",               // The displayed name of the eMSP in the User Agent.
    "base_url": "https://as.example.com", // The base URL of the eMSP's Authorization Server.
    "image": "assets/openid_charge.svg"   // (Optional) URL to the eMSP's logo displayed in the User Agent.
  }
]
```


##### 1.2.1.2. Secret eMSP Authorization Server Configuration

- File: `config/emsp_creds.json`
- Example File: [`config-example/emsp_creds.json`](./example-config/emsp_creds.json)

**Example:**
```json
{
  "sample_emsp": {  // The eMSP ID.
    "client_id": "example_emsp",  // The Client ID of the EV at the eMSP's Authorization Server.
    "client_secret": "aBc...giJ"  // The Client Secret of the EV at the eMSP's Authorization Server.
  }
}
```


##### 1.2.1.3. eMSP Backend Server Configuration

- File: `config/emsp_resource_ep.json`
- Example File: [`config-example/emsp_resource_ep.json`](./example-config/emsp_resource_ep.json)

```json
{
  "sample_emsp": "https://emsp.example.com" // Base URL of the eMSP's Backend Server.
}
```


### 1.3. Requirements

- Connection to the eMSP Backend and the eMSP's Authorization Server.


## 2. Development

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
