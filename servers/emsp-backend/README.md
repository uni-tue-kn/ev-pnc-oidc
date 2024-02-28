# e-Mobility Service Provider Backend

The Backend Server of the e-Mobility Service Provider (eMSP) that signs the Contract Certificate.

The software is written in [Go](https://go.dev/) with no focus on implementation security.
**Do not use this software in a productive environment!**


## 1. Documentation

### 1.1. REST API

The OpenAPI Specificatino is provided [here](./api/swagger.yaml).


### 1.2. Configuration

The eMSP Backend can be configured with the following environment variables:

**Port `PORT`**
  The Port that the server is listening to.
  Default is `8080`.

**Trusted Issuer `TRUSTED_ISSUER`**
  The URL of the trusted Authorization Server.
  Issued Access Tokens must contain this string as issuer (`iss` claim in payload).
  If `JWKS_URI` is not provided, appending `/.well-known/openid-configuration` must resolve the discovery document which contains the `jwks_uri` parameter.
  Example: `https://as.example.com`
  Setting this parameter is REQUIRED!

**Trusted Audience `TRUSTED_AUDIENCE`**
  The expected audience of used Access Tokens (`aud` claim in payload).
  Default is `emsp_backend`.

**JSON Web Key Set URI `JWKS_URI`**
  The URL to the public JSON Web Keys to expect the Access Token to be signed with.
  If not provided, the discovery document of the `TRUSTED_ISSUER` will be used.

**Required Scopes `REQUIRED_SCOPES`**
  Comma-separated required scopes.
  Example: `scope1,scope2`.
  Default is `csr`.

**CSR Directory `CSR_DIR`**
  Directory to download the CSR files to.
  Default is `./csr`.

**CRT Directory `CRT_DIR`**
  Directory to download the CRT files to.
  Default is `./crt`.

**Signing Command `SIGNING_CMD`**
  Command to sign the CSR.
  Default is `./scripts/sign-cert.sh`

**Signing Arguments `SIGNING_ARGS`**
  Space-separated signing command arguments.
  Use `${CSR_FILE}` as placeholder for the file path to the CSR File to sign.
  Use `${CRT_FILE}` as placeholder for the file path to the signed CRT File.
  Default is `${CSR_FILE} ${CRT_FILE}`.


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
# Build the container as "emsp-backend:latest" image
docker build --pull --rm -f ./Dockerfile -t emsp-backend:latest "./"

# Run the built container. Server will be available on http://localhost:8080
docker run -p "8080:8080" emsp-backend:latest
```
