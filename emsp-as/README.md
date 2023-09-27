# Authorization Server

OAuth 2 Authorization Server implementation of the eMSP.

This project was cloned from [here](https://github.com/authlete/gin-oauth-server).

**This is no security-focused project. DO NOT USE THIS IN PRODUCTION!**


## Setup

1. Rename the [`authlete.template.toml`](./authlete.template.toml) to `authlete.toml` and update the `ServiceApiKey` and `ServiceApiSecret` parameters with the API Key and API Secret from your Authlete service.
2. Run `make` to build the Authorization Server to the `gin-oauth-server` file.
3. Run `make run` to start the authorization server on `http://localhost:8080`.


## Docker

You can also build and start the Authorization Server using the provided [`Dockerfile`](./Dockerfile).


### Configuration

**`PORT`**
  Default: `8080`
  The port to listen to.


## Endpoints

This implementation exposes endpoints as listed in the table below.

| Endpoint                             | Path                                |
|:-------------------------------------|:------------------------------------|
| Authorization Endpoint               | `/api/authorization`                |
| Token Endpoint                       | `/api/token`                        |
| JWK Set Endpoint                     | `/api/jwks`                         |
| Configuration Endpoint               | `/.well-known/openid-configuration` |
| Revocation Endpoint                  | `/api/revocation`                   |
| Introspection Endpoint               | `/api/introspection`                |

The authorization endpoint and the token endpoint accept parameters described
in [RFC 6749][RFC6749], [OpenID Connect Core 1.0][OIDCCore],
[OAuth 2.0 Multiple Response Type Encoding Practices][MultiResponseType],
[RFC 7636][RFC7636] ([PKCE][PKCE]) and other specifications.

The JWK Set endpoint exposes a JSON Web Key Set document (JWK Set) so that
client applications can (1) verify signatures signed by this OpenID Provider
and (2) encrypt their requests to this OpenID Provider.

The configuration endpoint exposes the configuration information of this OpenID
Provider in the JSON format defined in [OpenID Connect Discovery 1.0][OIDCDiscovery].

The revocation endpoint is a Web API to revoke access tokens and refresh
tokens. Its behavior is defined in [RFC 7009][RFC7009].

The introspection endpoint is a Web API to get information about access
tokens and refresh tokens. Its behavior is defined in [RFC 7662][RFC7662].


## Authorization Request Example

The following is an example to get an access token from the authorization
endpoint using [Implicit Flow][ImplicitFlow]. Don't forget to replace
`{client-id}` in the URL with the real client ID of one of your client
applications. As for client applications, see
[Getting Started][AuthleteGettingStarted] and the document of
[Developer Console][DeveloperConsole].

    http://localhost:8080/api/authorization?client_id={client-id}&response_type=token

The request above will show you an authorization page. The page asks you to
input login credentials and click "Authorize" button or "Deny" button. The
dummy implementation of user database (`user_management.go`) contains the
following two accounts. Use either of them.

| Login ID | Password |
|:---------|:---------|
| `john`   | `john`   |
| `jane`   | `jane`   |
