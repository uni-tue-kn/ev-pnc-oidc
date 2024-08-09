# e-Mobility Service Provider Backend

The Backend Server of the e-Mobility Service Provider (eMSP) that signs the contract certificate.

The software is written in [Go](https://go.dev/) with no focus on implementation security.
**Do not use this software in a productive environment!**


## 1. Documentation

### 1.1. REST API

The OpenAPI Specification is provided [here](./api/swagger.yaml).


### 1.2. Configuration

The eMSP Backend can be configured using the following environment variables:

**Port `PORT`**
  The Port that the server is listening to.
  Default is `8080`.

**CSR Directory `CSR_DIR`**
  Directory to upload the certificate signing request files to.
  Default is `./csr`.

**CRT Directory `CRT_DIR`**
  Directory to write the signed contract certificates files to.
  Default is `./crt`.

**Signing Command `SIGNING_CMD`**
  Shell script to sign the certificate signing request.
  Default is `./scripts/sign-cert.sh`

**Signing Arguments `SIGNING_ARGS`**
  Space-delimited signing command arguments.
  Use `${CSR_FILE}` as placeholder for the file path to the certificate signing request file to sign.
  Use `${CRT_FILE}` as placeholder for the file path to the signed contract certificate file.
  Default is `${CSR_FILE} ${CRT_FILE}`.


## 2. Development

Go commands:

```bash
# Load packages
go get

# Start the server on "http://localhost:8080":
go run ./main.go

# Build the server with all its dependencies to the single binary "server":
go build -a -installsuffix cgo -o server .
```

Docker commands:

```bash
# Build the container as image "emsp-backend:latest":
docker build --pull --rm -f ./Dockerfile -t emsp-backend:latest "./"

# Run the built container on "http://localhost:8080":
docker run -p "8080:8080" emsp-backend:latest
```
