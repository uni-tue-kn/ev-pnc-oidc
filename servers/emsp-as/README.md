# e-Mobility Service Provider Autorization Server

This is the OAuth 2.0 Authorization Server implementation for the e-Mobility Service Provider (eMSP).

The software is written in [PHP](https://www.php.net/) and implements a web service which utilizes the [Authlete Authorization Server API](https://docs.authlete.com/en/shared/latest) as described [here](https://www.authlete.com/developers/overview/).
It is developed with no focus on implementation security.
**Do not use it in production environments!**


## 1. Documentation

### 1.1. REST API

The OpenAPI Specification is provided [here](./api/swagger.yaml).


### 1.2. Configuration

The eMSP Authorization Server can be configured using the following environment variables:

**Authlete API Key `API_KEY`**
  The API key used to access the Authlete Authorization Server API.
  Providing a valid API key is *required*.

**Authlete API Secret `API_SECRET`**
  The API secret used to access the Authlete Authorization Server API.
  Providing a valid API secret is *required*.

**Client ID `CLIENT_ID`**
  The OAuth 2.0 client ID of the legitimate OAuth 2.0 client.
  Providing a valid client ID is *required*.

**Client ID `CLIENT_SECRET`**
  The OAuth 2.0 client secret of the legitimate OAuth 2.0 client.
  Providing a valid client secret is *required*.


## 2. Development:

Run the service in an [Nginx container](https://hub.docker.com/_/nginx) combined with a [PHP-FPM container](https://hub.docker.com/_/php).
A Docker composition is provided [here](../docker-compose.yaml).

Docker compose commands:

```bash
# Run the container in the composition:
docker compose up as
```
