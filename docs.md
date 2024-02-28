# EV PnC Registration Flow

## 1. Connection Establishment

### 1.1. EV starts Setup

- The EV starts a Bluetooth LE server which provides a *Bluetooth LE HTTP Proxy Service* identified by a specific `{DEVICE_NAME}`, e.g., `MyEV`, using the [EspruinoHub Software](https://github.com/espruino/EspruinoHub) as described [here](https://www.espruino.com/BLE+HTTP+Proxy).
- The EV generates a *Connect URL* to its OEM provider's *PnC Setup App*, containing the URL-encoded `{DEVICE_NAME}` and `{REGISTRATION_ENDPOINT}`, e.g., `https://oem-app.pnc.primbs.dev/connect?device_name=MyEV`.
- The EV generates a QR Code which represents the *Connect URL*.

### 1.2. Credentials Transfer

- The user starts the camera app on his smartphone and scans the QR code.

### 1.3. User Agent prepares Connection to EV

- The smartphone opens the *Connect URL* in a Chromium-based web browser, e.g., Google Chrome for Android.
- This loads the [User Agent](./user-agent/README.md) which is an [Angular](https://angular.io/) single page web application.
- The user than clicks the Connect button.
- The User Agent then utilizes the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) in the browser to open a popup which shows nearby Bluetooth LE devices filtered by the `{DEVICE_NAME}`.
- The user then selects his EV and chooses to connect to the device.

### 1.4. User Agent connects to EV

- The User Agent then connects to the EV via Bluetooth LE which establishes an end-to-end encrypted data channel by default.
- The User Agent then connects to the GATT [HTTP-Proxy-Service](https://www.bluetooth.com/de/specifications/specs/http-proxy-service-1-0/).

## 2. Configuration Request

### 2.1. User Agent requests eMSP Configuration

- The User Agent requests a list of supported eMSPs via the BLE HTTP Proxy Service from the EV's `{EMSP_ENDPOINT}`: `http://ev.local/emsp`

### 2.2. EV Backend looks up supported eMSPs

- On the EV runs the [EV Backend Server](./ev-backend/README.md) which is addressable by the Bluetooth LE HTTP Proxy Service.
- This EV Backend Server is an HTTP server written in [Go](https://go.dev/) which provides multiple endpoints.
- On the `/emsps` endpoint, the EV Backend responds with a list of EMSP JSON objects which contain the base URL of the eMSPs' Authorization Server, e.g., `https://sso.emsp1.pnc.primbs.dev/`, and other relevant information.
- Such a list might look like this:
```json
[
  {
    "id": "oidc",
    "name": "OpenID Charge",
    "base_url": "https://as.example.com/",
    "image": "assets/openid_charge.svg",  // Optional
  },
  {
    "id": "ionity",
    "name": "Ionity",
    "base_url": "http://localhost:8080",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionity_logo_cmyk.svg",  // Optional
  },
]
```
- The EV might have this list cached, directly downloaded from the OEM, or hardcoded in its firmware.

### 2.3. EV Backend responds with eMSPs

- The EV responds with the list of eMSPs via the BLE HTTP Proxy Service to the User Agent.

### 2.4. User selects eMSP

- The User Agent visualizes the eMSP list to the user.
- The user selects his preferred eMSP.

## 3. Contract Provisioning Request

### 3.1. User modifies Permissions

- The User Agent displays available permissions to the user.
- The user adjusts the contract parameters in the User Agent:
  - Contract start time (leave empty to start now), e.g., `2023-07-01`
  - Contract end time (leave empty to end in one year), e.g., `2024-07-01`
  - Maximum amount (leave empty for unlimited), e.g., `234.56 €`
  - Maximum transaction amount (leave empty for unlimited), e.g., `100.00 €`

### 3.2. User Agent sends Contract Provisioning Request to EV Backend

- The User Agent generates contract details for the Rich Authorization Request:
```json
{
  "type": "pnc_contract_request",
  "charging_period": {
    "start": "2023-07-01T00:00:00.000Z",
    "end": "2024-07-01T00:00:00.000Z"
  },
  "maximum_amount": {
    "currency": "EUR",
    "amount": "234.56"
  },
  "maximum_transaction_amount": {
    "currency": "EUR",
    "amount": "100.00"
  }
}
```
- The User Agent sends this contract details together with the selected eMSP and a redirect URI via the BLE GATT Service to the EV Backend as the body of an HTTP POST Request:
```json
{
  "emsp_id": "oidcharge",
  "redirect_uri": "https://user-agent.example.com/redirect",
  "authorization_detail": {
    "type": "pnc_contract_request",
    "charging_period": {
      "start": "2023-07-01T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    },
    "maximum_amount": {
      "currency": "EUR",
      "amount": "234.56"
    },
    "maximum_transaction_amount": {
      "currency": "EUR",
      "amount": "100.00"
    }
  }
}
```
- The EV Backend then performs the Pushed Authorization Request as described in [Section 4](#4-authorization-request):
```http
POST /cpr HTTP/1.1
Host: ev.localhost
Content-Type: application/json

{
  "emsp_id": "oidcharge",
  "redirect_uri": "https://user-agent.example.com/redirect",
  "authorization_detail": {
    "type": "pnc_contract_request",
    "charging_period": {
      "start": "2023-07-01T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    },
    "maximum_amount": {
      "currency": "EUR",
      "amount": "234.56"
    },
    "maximum_transaction_amount": {
      "currency": "EUR",
      "amount": "100.00"
    }
  }
}
```


### 3.3. Pushed Authorization Request


#### 3.3.1. Prepare Proof Key for Code Exchange

The EV generates a random string, called Code-Verifier, e.g.:
```
FGZZto2HtgeC6vAIYb50kNJNCr2AIv-jIU8rbQUpxxUtyuwEVbnXcVsmZ0Ws6IQ401Z9W_9RPNZ5sHRJOuKN7vPrggUwdR2_fgdUYNHly2zFnYMhFu6clwHPtBFT3C9Z
```

The EV then hashes the Code-Verifier with SHA-256 and encodes it Base64URL:
```
Vun1_GO-sLNaY6BqfUZnumUV0QDzMj2TlLfpmuVoFXs
```


#### 3.3.2. Send Pushed Authorization Request

The EV generates a Pushed Authorization Request and sends it to the Pushed Authorization Request Endpoint of the eMSP's Authorization Server:
```http
POST /api/par HTTP/1.1
Host: authorization-server.example.com
Content-Type: application/x-www-form-urlencoded

response_type=code&
client_id=example_emsp&
client_secret=aBcDeFgHiJKlMnOpQrStUvWxYz0123456789_-AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-aBcDeFgHiJ&
redirect_uri=https%3A%2F%2Foem-app.pnc.primbs.dev%2Fauthorize&
code_challenge=nUg2hWlS95kZ1qT8H6RbLljkD1txlP11LyKh-u3j5pE&
code_challenge_method=S256&
scope=ccsr&
authorization_details=%7B%22emsp_id%22%3A%22oidcharge%22%2C%22redirect_uri%22%3A%22https%3A%2F%2Fuser-agent.example.com%2Fredirect%22%2C%22authorization_detail%22%3A%7B%22type%22%3A%22pnc_contract_request%22%2C%22charging_period%22%3A%7B%22start%22%3A%222023-07-01T00%3A00%3A00.000Z%22%2C%22end%22%3A%222024-07-01T00%3A00%3A00.000Z%22%7D%2C%22maximum_amount%22%3A%7B%22currency%22%3A%22EUR%22%2C%22amount%22%3A%22234.56%22%7D%2C%22maximum_transaction_amount%22%3A%7B%22currency%22%3A%22EUR%22%2C%22amount%22%3A%22100.00%22%7D%7D%7D
```


#### 3.3.4. Send Pushed Authorization Response

- The Authorization Server generates a request URI, valid for a few seconds:
```json
{
  "request_uri": "urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a",
  "expires_in": 60
}
```
The Authorization Server responds with this request URI to the EV:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "request_uri": "urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a",
  "expires_in": 60
}
```


### 3.4. User Agent gets Contract Provisioning Response from EV Backend

- The EV Backend responds to the User Agent via Bluetooth with the Contract Provisioning Response:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "request_uri": "urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a",
  "client_id": "oidcharge",
  "state": "OacnSace5b"
}
```


## 4 Authorization Request

### 4.1. Send Authorization Request

- The User Agent discovers the Authorization Endpoint from the Authorization Server's well-known endpoint.
- The User Agent opens a new tab to the Authorization Endpoint and adds the `request_uri` and `client_id` obtained from the EV.
- The URL might look like this:
```
https://authorization-server.example.com/authorize?client_id=123456789012345&request_uri=urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a
```


### 4.2. User Sign In

- In the new tab, the user authenticates with its credentials or with an active session.


### 4.3. Client Authorization

- The Authorization Server displays the authorization details to the user.
- The user carefully checks whether the authorization details match the expected ones.
- The user authorizes the authorization details.


### 4.4. Send Authorization Response

- The Authorization Server redirects the user to the Redirect URI from the Pushed Authorization Request.
- This request contains the authorization code in the `code` Query Parameter:
```
https://user-agent.example.com/redirect?code=YZZgOg66fJ1Ix3rS8HfREhUzZTJa9u4f0LWtAHR_yB4&state=5m3Pu1jbEf3ouyg7f5ca
```


## 5. Request a Contract Certificate


### 5.1. User Agent sends a Confirmation Request to the EV Backend

- The User Agent sends a HTTP POST Request via BLE to the EV Backend.
- This Request contains the authorization code from the Authorization Server as `auth_code` parameter and the state identifier as `state` parameter:
```http
POST /confirm HTTP/1.1
Host: ev.localhost
Content-Type: application/json

{
  "auth_code": "YZZgOg66fJ1Ix3rS8HfREhUzZTJa9u4f0LWtAHR_yB4",
  "state": "5m3Pu1jbEf3ouyg7f5ca"
}
```


### 5.2. EV Backend performs Token Request

- The User Agent discovers the Token Endpoint from the Authorization Server's well-known endpoint:
```http
GET /.well-known/openid-configuration HTTP/1.1
Host: authorization-server.example.com


```


#### 5.2.1. EV Backend sends Token Request to Authorization Server

- The User Agent sends a Token Request to the Authorization Server.
- This request contains the Authorization Code from the User Agent as `code` parameter, the Client ID as `client_id` parameter, the Client Secret as `client_secret` parameter, the value `authorization_code` as `grant_type`, the Redirect URI from the User Agent as `redirect_uri` parameter, and the Proof Key as `code_verifier`.

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=YZZgOg66fJ1Ix3rS8HfREhUzZTJa9u4f0LWtAHR_yB4&
redirect_uri=https%3A%2F%2Fuser-agent.example.com%2Fredirect&
code_verifier=FGZZto2HtgeC6vAIYb50kNJNCr2AIv-jIU8rbQUpxxUtyuwEVbnXcVsmZ0Ws6IQ401Z9W_9RPNZ5sHRJOuKN7vPrggUwdR2_fgdUYNHly2zFnYMhFu6clwHPtBFT3C9Z&
client_id=123456789012345&
client_secret=aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789-_AbCdEfGhIjKlMnOpQrStUvWxYz0123456789-_aBcDeFgHiJ
```


#### 5.2.2. Authorization Server verifies Request and Issues Access Token

- The Authorization Server validates the request parameters.
- If valid, the Authorization Server issues an Access Token which contains the authorized scopes and authorization details.


#### 5.2.3. Authorization Server responds with Access Token

- The Authorization Server sends the Access Token as `access_token` parameter to the EV in the HTTP POST body.


### 5.3. Contract Certificate Request


#### 5.3.1. EV generates a Contract Certificate Signing Request

- The EV uses the OpenSSL CLI to generate a new asymmetric key pair.
- The EV uses the OpenSSL CLI to create a certificate signing request for the Contract Certificate


#### 5.3.2. EV sends Contract Certificate to eMSP Backend

- The EV sends the Contract Certificate Signing Request to the [eMSP Backend](./emsp-backend/README.md).
- To prove authorization, the EV adds the Access Token as `bearer` token to the `Authorization` header.
- The Body of the HTTP POST Request is PEM encoded and of content type `application/pkcs10`:
```http
POST /csr HTTP/1.1
Host: emsp-backend.example.com
Content-Type: application/pkcs10
Authorization: bearer ey...Yv

-----BEGIN CERTIFICATE REQUEST-----
MIIEtDCCApwCAQAwPzELMAkGA1UEBhMCREUxEzARBgNVBAoMCkNhckNvbXBhbnkx
GzAZBgNVBAMMEkRFLThBQS0xQTJCM0M0RDUtOTCCAiIwDQYJKoZIhvcNAQEBBQAD
ggIPADCCAgoCggIBAM8nFqug+AEI2vGU1MPPvaYeAnkQxZmN8oRGc/qvRctg+x3X
YVivgsT6W79OVbosw4kVMdKYpIc+Ra9CQOVieGG7Wg21H2IIZHE/6Iu/E2kg6rFe
UusxJ7U9YxF8x283UcaUAt7m96B/2ht/O7/QEoO66nIP7ZAsj6Elq118CX04D5LN
T4nTXzz+jeQcq8N7G2h8xkNx1Ksd+tYAb/Wsy7x7bM01TXvYppoL0qkDi3AuYMXp
voJC8LlZs0buZLRDqgoyonfMPhVG+upyITtZ1wOwCQAFgbmkd1HdO88UDGWPT3oc
hL3AiZgdZ9cdRtzmpQ9hT/X6IlpgIizTrJ0xSXzJhB3PIozxwcVVHW5S+HL6f8Ne
CMr0XeudoUgABpKge9Ky38vLAe2EXUq92aZ+H4m3Hg0zOKffp91cOvX63iXRflyM
JxXTVK3Dvv525JsrTeqLcCSLb3khiEPMylQR6AnVkeDuYsF7SStvpcXeRmlijN0E
SttLjcd2GCNrkJUjUBpIQZbK4lSoQArGcjyThJnrbLFZ5mxkibQGhEqsUgSPSoEj
D75xjJFkuwPv2k6LhN73Y0SXP3vS9mrZcgfe/16/QA5Lp7eutIVArK82bQWFfQ1y
G1lPNcUL6mcINGpG7WzBQJMJ4J+SYTrIb9FSr58ilok4Q9nFztGiiE2yTs4LAgMB
AAGgMDAuBgkqhkiG9w0BCQ4xITAfMB0GA1UdEQQWMBSCEkRFLThBQS0xQTJCM0M0
RDUtOTANBgkqhkiG9w0BAQsFAAOCAgEAFIdkjOoN3yOR6ftvL5bloRkfNUnTwBaJ
IEeqiL12hlTWeTqyyMAmLdFmXOCCBXpSvV6jtoFxWOUx857Qs0l/OKI0VLAzaNeK
8IDb08+2Fwl1zenkLMvy09XKIpUrIyW6pYJzVrUEI3vXE0gZ6H8PKgtWgJyBk9uX
xkPLZXSt6nH9mYYeVBJbO9blFrWHNtx6xMX2WV9HkEctsSPg1r6ygp0vBOCXn53Y
l1jQUjtK2WRkm8iSHCNMJYnYoUiEs5Ms6BF+18Atcqrkha5UrD8yh7PtdXdJQg2H
Z+JGnMU2Xp6nvceGT6nRo6kZrn4LrQ7Ajc/eesovzTbi6ES9vcJThpzvtFJpF8VW
r0ob9CqeC6rJnxyhI0rtv+NpIUyntEr7rTzd4KQMdikYrEumjaBAuxl8cKHrQ583
4Or6u+Pm+COYl7U2XiRnw1e+SsO7aAZ/IivfoqP6TgAfuVd5d7przo9nZ4F0Ob0m
ATKlEh21+qjCXvV0Wtku3kjUv+ARClQrk2IJGF8nN+p/jJfE+3boOAyc9Ca94Y7G
g50KCtFSZTPQ3vQZhg/CkkmKK6KRxsw2yASpEr8TPahY3Nzmk4tqzsHhFWpLqWh1
zZ7v6QFJY6s9ZGSnAVDH6heU9E1y9t6PaYauiS6ASA8nBpdS+MK/NnsTczIJxXC2
8n1woPLgzuk=
-----END CERTIFICATE REQUEST-----
```


#### 5.3.3. eMSP Backend validates Access Token and CSR

- The Reverse Proxy validates the Authorization Header of the Contract Certificate Request.
- If the Access Token is valid, the Reverse Proxy forwards the Request to the eMSP Backend.
- The eMSP Backend downloads the CSR from request body.
- The eMSP Backend uses the OpenSSL CLI to sign the contract certificate.


#### 5.3.4. eMSP Backend sends Contract Certificate to EV

- After generating the Contract Certificate, the eMSP Backend reads the certificate file.
- The eMSP Backend then sends the Contract Certificate PEM encoded of content type `application/x-x509-user-cert` back to the eMSP in the POST response body.
- The EV Backend writes this contract certificate to the `OUTPUT_FILE` (from environment):
```http
HTTP/1.1 201 Created
Content-Type: application/x-x509-user-cert; charset=UTF-8

-----BEGIN CERTIFICATE-----
MIIDWDCCAv4CAQMwCgYIKoZIzj0EAwIwZjELMAkGA1UEBhMCREUxCzAJBgNVBAgM
AkJXMRIwEAYDVQQHDAlTdHV0dGdhcnQxEjAQBgNVBAoMCU9JRENoYXJnZTEiMCAG
A1UEAwwZZW1zcC5vaWRjaGFyZ2UucHJpbWJzLmRldjAeFw0yNDAyMjgxNjI1MjVa
Fw0yNDA1MjgxNjI1MjVaMD8xCzAJBgNVBAYTAkRFMRMwEQYDVQQKDApDYXJDb21w
YW55MRswGQYDVQQDDBJERS04QUEtMUEyQjNDNEQ1LTkwggIiMA0GCSqGSIb3DQEB
AQUAA4ICDwAwggIKAoICAQDPJxaroPgBCNrxlNTDz72mHgJ5EMWZjfKERnP6r0XL
YPsd12FYr4LE+lu/TlW6LMOJFTHSmKSHPkWvQkDlYnhhu1oNtR9iCGRxP+iLvxNp
IOqxXlLrMSe1PWMRfMdvN1HGlALe5vegf9obfzu/0BKDuupyD+2QLI+hJatdfAl9
OA+SzU+J0188/o3kHKvDextofMZDcdSrHfrWAG/1rMu8e2zNNU172KaaC9KpA4tw
LmDF6b6CQvC5WbNG7mS0Q6oKMqJ3zD4VRvrqciE7WdcDsAkABYG5pHdR3TvPFAxl
j096HIS9wImYHWfXHUbc5qUPYU/1+iJaYCIs06ydMUl8yYQdzyKM8cHFVR1uUvhy
+n/DXgjK9F3rnaFIAAaSoHvSst/LywHthF1Kvdmmfh+Jtx4NMzin36fdXDr1+t4l
0X5cjCcV01Stw77+duSbK03qi3Aki295IYhDzMpUEegJ1ZHg7mLBe0krb6XF3kZp
YozdBErbS43Hdhgja5CVI1AaSEGWyuJUqEAKxnI8k4SZ62yxWeZsZIm0BoRKrFIE
j0qBIw++cYyRZLsD79pOi4Te92NElz970vZq2XIH3v9ev0AOS6e3rrSFQKyvNm0F
hX0NchtZTzXFC+pnCDRqRu1swUCTCeCfkmE6yG/RUq+fIpaJOEPZxc7RoohNsk7O
CwIDAQABMAoGCCqGSM49BAMCA0gAMEUCIQC23By+3F1zegVP45JnK02VPcE94HqN
KWqmO/OJhXKzqQIgD/qN1FXSDkeZIjGUvRAYG+ZSVezPaMJYW3up04OZviM=
-----END CERTIFICATE-----
```
