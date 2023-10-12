# eMSP Authorization Server

The Authorization Server of the eMSP where the user authorizes the Client.


## Documentation

### REST API

The OpenAPI Specificatino is provided [here](./api/swagger.yaml).


## Configuration

The Authorization Server can be configured with the following environment variables:

**Port `PORT`**
  The Port that the server is listening to.
  Default is `8080`.

**Service API Key `SERVICE_API_KEY`**
  The Authlete Service API Key.
  Setting this parameter is REQUIRED, if `SERVICE_API_KEY_FILE` is not set!

**Service API Key File `SERVICE_API_KEY_FILE`**
  The file which contains the Authlete Service API Key.
  Setting this parameter is REQUIRED, if `SERVICE_API_KEY` is not set!

**Service API Secret `SERVICE_API_SECRET`**
  The Authlete Service API Secret.
  Setting this parameter is REQUIRED, if `SERVICE_API_SECRET_FILE` is not set!

**Service API Secret File `SERVICE_API_SECRET_FILE`**
  The file which contains the Authlete Service API Secret.
  Setting this parameter is REQUIRED, if `SERVICE_API_SECRET` is not set!

**Keys Directory `KEYS_DIR`**
  The directory which contains the key files.
  Default is `./keys`.

**User Credentials File `USER_CREDS`**
  The .json file which contains the credentials of the users.
  default is `./config/users.json`.


### User Configuration

Users can be defined in the .json file specified in `USER_CREDS`.

Example:
```json
[
  {
    "username": "john",
    "password": "Smith",
    "name": "John Smith",
    "family_name": "Smith",
    "first_name": "John"
  }
]
```


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
# Build the container as "emsp-as:latest" image
docker build --pull --rm -f ./Dockerfile -t emsp-as:latest "./"

# Run the built container. Server will be available on http://localhost:8080
docker run -p "8080:8080" emsp-as:latest
```
