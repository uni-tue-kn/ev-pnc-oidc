# EV PnC Registration Flow

## 1. EV starts Setup

- The EV starts a Bluetooth LE server which provides a *Bluetooth LE HTTP Proxy Service* identified by a specific `{DEVICE_NAME}`, e.g., `MyEV 1234`, using the [EspruinoHub Software](https://github.com/espruino/EspruinoHub) as described [here](https://www.espruino.com/BLE+HTTP+Proxy).
- The EV generates a *Connect URL* to its OEM provider's *PnC Setup App*, containing the URL-encoded `{DEVICE_NAME}` and `{REGISTRATION_ENDPOINT}`, e.g., `https://oem-app.pnc.primbs.dev/connect?device_name=MyEV%201234&registration_endpoint=http%3A%2F%2Fev.local%2Fregister`.
- The EV generates a QR Code which represents the *Connect URL*:

![https://oem-app.pnc.primbs.dev/connect?device=MyEV%201234](src/qrcode_oem-app.pnc.primbs.dev.png)

## 2. User Agent connects to EV

- The User starts the camera app on his smartphone (called User Agent) and scans the QR code.
- The User Agent opens the *Connect URL* in a Chromium-based web browser, e.g., Google Chrome for Android.
- This loads the OEM provider's *PnC Setup App*, which is an [Angular](https://angular.io/) single page web application.
- The user than clicks the Connect button.
- The app then utilizes the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) in the browser to open a popup which shows nearby Bluetooth LE devices filtered by the `{DEVICE_NAME}`.
- The user then selects his EV and chooses to connect to the device.
- The app then connects to the EV via Bluetooth LE which establishes an end-to-end encrypted data channel by default.
- The app then connects to the GATT [HTTP-Proxy-Service](https://www.bluetooth.com/de/specifications/specs/http-proxy-service-1-0/).

## 3. User Agent prepares PnC Registration

- In the backend of the EV also runs a *PnC Client Server* which is addressable by the *Bluetooth LE HTTP Proxy Service*.
- This *PnC Client Server* is an HTTP server written in [Go](https://go.dev/) which provides multiple endpoints.
- The *PnC Setup App* requests the list of enabled eMSPs from the EV's *PnC Client Server* using the `{EMSP_ENDPOINT}`, e.g., `http://ev.local/emsp`.
- This list is an enumeration of JSON objects which contain the base URL of the eMSPs' Authorization Server, e.g., `https://sso.emsp1.pnc.primbs.dev/`, and other relevant information.
- Such a list might look like this:
```json
[
  {
    "base_url": "https://authlete.com",
    "image": "assets/openid_charge.svg",
    "name": "OpenID Charge",
    "client_id": "150558547826224",
    "id": "oidc",
  },
  {
    "base_url": "http://localhost:8080",
    "image": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionity_logo_cmyk.svg",
    "name": "Ionity",
    "client_id": "ionity_ev",
    "id": "ionity",
  },
]
```
- The EV might have this list cached, directly downloaded from the OEM, or hardcoded in its firmware.
- In the background, the EV knows, which eMSP requires OEM Authentication which means that the EV must send a CCSR signed with the OEM Certificate.

## 4. User selects eMSP

- The app visualizes the eMSP list to the user.
- The user selects his preferred eMSP.

## 5. User adjusts Contract

- The user adjusts the contract parameters in the web app:
  - Contract start time (leave empty to start now), e.g., `2023-07-01`
  - Contract end time (leave empty to end in one year), e.g., `2024-07-01`
  - Maximum amount (leave empty for unlimited), e.g., `234.56 €`
  - Maximum transaction amount (leave empty for unlimited), e.g., `100.00 €`
- The app generates contract details for the Rich Authorization Request:
```json
{
  "locations": [
    "https://pnc.emsp1.pnc.primbs.dev/authorize"
  ],
  "chargingPeriod": {
    "start": "2023-07-01T00:00:00.000Z",
    "end": "2024-07-01T00:00:00.000Z"
  },
  "maximumAmount": {
    "currency": "EUR",
    "amount": "234.56"
  },
  "maximumTransactionAmount": {
    "currency": "EUR",
    "amount": "100.00"
  }
}
```

## 6. Request Contract Provisioning

- The *PnC Client Server* also provides a `{REGISTRATION_ENDPOINT}`, e.g., `http://ev.local/register`.
- The app sends an HTTP request via the HTTP-Proxy-Service through the end-to-end encrypted Bluetooth LE connection to the EV's `{REGISTRATION_ENDPOINT}` to request a PnC registration initialization on the *PnC Client Server*.
- This request contains these contract details together with the information about the eMSP to the EV:
```json
{
  "emsp": {
    "base_url": "https://sso.emsp1.pnc.primbs.dev/",
    "requires_oem_authentication": true,
    "image": "https://emsp1.pnc.primbs.dev/logo.svg",
    "name": "Privacy eMSP",
    "client_id": "oem-app",
    "client_secret": "supersecret!"
  },
  "contract": {
    "locations": [
      "https://pnc.emsp1.pnc.primbs.dev/authorize"
    ],
    "chargingPeriod": {
      "start": "2023-07-01T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    },
    "maximumAmount": {
      "currency": "EUR",
      "amount": "234.56"
    },
    "maximumTransactionAmount": {
      "currency": "EUR",
      "amount": "100.00"
    }
  }
}
```

## 7. EV prepares Token Request

- The *PnC Client Server* generates a new elliptic curve key pair using the P-256 curve.
  - The private key in JWK format looks like this:
```json
{
  "kty":"EC",
  "crv":"P-256",
  "x":"KCbXOs51MGdCVL4o9pfTbcUYpumvR15F01_S0gcasL0",
  "y":"pk4YQUagTaTRJIX0rMuhEFdqDrzV3H7sHKKm_VK34I4",
  "d":"hNHvogR7IO7pmrYuzuTHdOcwztaBX4rtdfIXXkqvcSA"
}
```
  - The public key in JWK format looks like this:
```json
{
  "kty":"EC",
  "crv": "P-256",
  "x":"KCbXOs51MGdCVL4o9pfTbcUYpumvR15F01_S0gcasL0",
  "y":"pk4YQUagTaTRJIX0rMuhEFdqDrzV3H7sHKKm_VK34I4"
}
```
- The *PnC Client Server* also generates a random string for PKCE challenge, called Code Verifier.
- The *PnC Client Server* hashes this Code Verifier with SHA-256. The hash is called Code Challenge.

## 8. EV generates Contract Certificate Request Token

- The *PnC Client Server* uses the contract details from the app to create the authorization request parameters for an [OAuth 2.0 Rich Authorization Request (RAR)](https://datatracker.ietf.org/doc/html/rfc9396) which also contain the EV's ID (`evId`) provided by the OEM in the OEM Manufacturer Certificate:
```json
[
  {
    "type": "ev_information",
    "locations": [
      "https://pnc.emsp1.pnc.primbs.dev/authorize"
    ],
    "actions": [
      "authorize",
      "cancel"
    ],
    "chargingPeriod": {
      "start": "2023-07-01T00:00:00.000Z",
      "end": "2024-07-01T00:00:00.000Z"
    },
    "maximumAmount": {
      "currency": "EUR",
      "amount": "234.56"
    },
    "maximumTransactionAmount": {
      "currency": "EUR",
      "amount": "100.00"
    },
    "evId":"uw3nT48bnt"
  }
]
```

## 9. EV sends Request to eMSP

- The *PnC Client Server* sends this RAR as an [OAuth 2.0 Pushed Authorization Request (PAR)](https://datatracker.ietf.org/doc/rfc9126/) to the eMSP's AS.
- The PAR looks like this:
```http
POST /par/request HTTP/1.1
Content-Type: application/x-www-form-urlencoded

response_type=code&
client_id=oem-app&
client_secret=supersecret%21&
redirect_uri=https%3A%2F%2Foem-app.pnc.primbs.dev%2Fauthorize&
code_challenge=nUg2hWlS95kZ1qT8H6RbLljkD1txlP11LyKh-u3j5pE&
code_challenge_method=S256&
scope=pnc_authorize&
authorization_details=%7B%22start%22%3A%222023-07-01T00%3A00%3A00.000Z%22%2C%22end%22%3A%222024-07-01T00%3A00%3A00.000Z%22%7D%2C%22maximumAmount%22%3A%7B%22currency%22%3A%22EUR%22%2C%22amount%22%3A%22123.45%22%7D%2C%22evId%22%3A%22uw3nT48bnt%22%7D%5D
```

## 10. eMSP responds with Request URI

- The eMSP's Authorization Server validates the request and generates a `request_uri`.
- The response body to the app looks like this:
```json
{
  "request_uri": "urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a",
  "expires_in": 60
}
```

## 11. EV responds to User Agent with Request URI

- The EV responds to the User Agent via BLE with the received `request_uri`.

## 12. User Agent start Authorization Request

- The User Agent navigates the user to the eMSP's Authorization Server's Authorization Endpoint `https://sso.emsp1.pnc.primbs.dev/authorize?client_id=oem-app&request_uri=urn:ietf:params:oauth:request_uri:94220043-b417-4ab4-a913-afc4dd1cc87a`.

## 13. eMSP's AS authenticates User

- The user enters his credentials to login.

## 14. User authorizes the Charging Contract

- The user will be asked to authorize the User Agent for the requested `pnc_authorize` scope, and to check the contract details.
- The user thereby must verify that the `evId` matches the ID of the EV which is displayed on the infotainment screen of the EV.

## 15. Authorization Response

- If the contract was granted by the user, the Authorization Server redirects the user to the User Agent with an authorization code as query parameter `code`: `https://oem-app.pnc.primbs.dev/authorize?code=b0d93df4-cc6c-49e3-8388-f30332b4b497`.

## 16. User Agent forwards Authorization Code to EV

- The User Agent takes the Authorization Code and sends it via BLE to the EV.

## 17. Token Request

- The EV uses the Authorization Code and the Code Verifier to request an Access Token using an XHR Request in background:
```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=b0d93df4-cc6c-49e3-8388-f30332b4b497&
redirect_uri=https%3A%2F%2Foem-app.pnc.primbs.dev%2Fauthorize&
code_verifier=1dWuf2bBIhaGOgCb0WVVHjs6wsGqcdLmtE9DuWmkScvevQKnzu3yNnUlEoPbR9Th&
client_id=oem-app&
client_secret=supersecret!
```

## 18. Token Response

- The eMSP's AS verifies the Token Request.
- If valid, the eMSP's AS responds with an Access Token.
- This Access Token authorizes its possessor to request a Contract Certificate for the granted device ID.

## 19. EV prepares Contract Certificate Signing Request (CCSR)

- The EV prepares a CCSR and signs it with its EC private key to prove its possession.
- If required by the eMSP, the EV also signs it with its OEM Manufacturer Certificate.

## 20. EV requests Contract Certificate

- The EV directly sends the CCSR to the `{CONTRACT_CERTIFICATE_ENDPOINT}` of the eMSP, e.g., `https://cc.emsp1.pnc.primbs.dev/csr`.
- The EV uses the obtained Access Token as Bearer Token in the `Authorization` header.

## 21. eMSP issues Contract Certificate

- The eMSP verifies the Access Token and that the EV ID matches the `evId` parameter in the Access Token.
- The eMSP verifies the validity of the CCSR.
- If both are valid, the eMSP generates a Contract Certificate and signs it with its private key.
- The eMSP responds to the EV with the signed CC.

## 22. EV notifies User

- If the request was successful and the EV obtained the CC, the EV responds to the User Agent with `200 OK`.
- The EV also displays a successful CC Registration on the infotainment screen.
