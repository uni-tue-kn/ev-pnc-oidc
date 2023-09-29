# Authorization Server

OAuth 2 Authorization Server implementation of the eMSP.

This project was cloned from [here](https://github.com/authlete/java-oauth-server).

**This is no security-focused project. DO NOT USE THIS IN PRODUCTION!**


## How To Run

1. Rename the [`authlete.template.properties`](./authlete.template.toml) to `authlete.properties` and update the `ServiceApiKey` and `ServiceApiSecret` parameters with the API Key and API Secret from your Authlete service.
2. Make sure that you have installed [maven][42] and set `JAVA_HOME` properly.
3. Start the authorization server on [http://localhost:8080][38].

  $ mvn jetty:run &


## Docker

You can also build and start the Authorization Server using the provided [`Dockerfile`](./Dockerfile).

If you would prefer to use Docker, just hit the following command after the step 2.

  $ docker-compose up


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
| UserInfo Endpoint                    | `/api/userinfo`                     |
| Dynamic Client Registration Endpoint | `/api/register`                     |
| Pushed Authorization Request Endpoint| `/api/par`                          |
| Grant Management Endpoint            | `/api/gm/{grantId}`                 |
| Federation Configuration Endpoint    | `/.well-known/openid-federation`    |

The authorization endpoint and the token endpoint accept parameters described
in [RFC 6749][1], [OpenID Connect Core 1.0][13],
[OAuth 2.0 Multiple Response Type Encoding Practices][33], [RFC 7636][14]
([PKCE][15]) and other specifications.

The JWK Set endpoint exposes a JSON Web Key Set document (JWK Set) so that
client applications can (1) verify signatures by this OpenID Provider and
(2) encrypt their requests to this OpenID Provider.

The configuration endpoint exposes the configuration information of this
OpenID Provider in the JSON format defined in [OpenID Connect Discovery 1.0][35].

The revocation endpoint is a Web API to revoke access tokens and refresh
tokens. Its behavior is defined in [RFC 7009][21].

The introspection endpoint is a Web API to get information about access
tokens and refresh tokens. Its behavior is defined in [RFC 7662][32].

The userinfo endpoint is a Web API to get information about an end-user.
Its behavior is defined in [Section 5.3. UserInfo Endpoint][41] of
[OpenID Connect Core 1.0][13].

The dynamic client registration endpoint is a Web API to register and update
client applications. Its behavior is defined in [RFC 7591][43] and [RFC 7592][44].

The pushed authorization request endpoint (a.k.a. PAR endpoint) is a Web API
to register an authorization request in advance and obtain a request URI.
Its behavior is defined in [RFC 9126][45].

The grant management endpoint is a Web API to get information about a grant ID
and revoke a grant ID. Its behavior is defined in [Grant Management for OAuth 2.0][46].

The federation configuration endpoint is a Web API that publishes the entity
configuration of the authorization server in the JWT format. Its behavior is
defined in [OpenID Connect Federation 1.0][OIDC_FED].


## Authorization Request Example

The following is an example to get an access token from the authorization
endpoint using [Implicit Flow][16]. Don't forget to replace `{client-id}` in
the URL with the real client ID of one of your client applications. As for
client applications, see [Getting Started][10] and the [document][17] of
_Developer Console_.

    http://localhost:8080/api/authorization?client_id={client-id}&response_type=token

The request above will show you an authorization page. The page asks you to
input login credentials and click "Authorize" button or "Deny" button. Use
one of the following as login credentials.

| Login ID | Password |
|:--------:|:--------:|
|   john   |   john   |
|   jane   |   jane   |
|   max    |   max    |
|   inga   |   inga   |

Of course, these login credentials are dummy data, so you need to replace
the user database implementation with your own.

The account `max` is for the old draft of
[OpenID Connect for Identity Assurance 1.0][IDA] (IDA). The account holds
_verified claims_ in the old format. Authlete 2.2 accepts the old format
but Authlete 2.3 onwards will reject it.

The account `inga` is for the third Implementer's Draft of [IDA][IDA] onwards.
Use `inga` for testing the latest IDA specification. However, note that
the third Implementer's Draft onwards is supported from Authlete 2.3.
Older Authlete versions do not support the latest IDA specification.

