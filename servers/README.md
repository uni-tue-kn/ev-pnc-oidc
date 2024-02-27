# Servers

The servers are typically hosted on the Internet.
However, since this is a research project with no focus on implementation security, **we highly recommend to not expose any of the services directly to the Internet!**


## 1. Services Overview

- Reverse Proxy: A [Traefik](https://doc.traefik.io/traefik/) reverse proxy which handles manages TLS connections and domain name resolution for the services.
- [User Agent](./user-agent/README.md): The user's application on the smartphone. Used to authorize the EV for charging.
- [eMSP Authorization Server](./emsp-as/README.md): The Authorization Server of the e-Mobility Service Provider.
- [eMSP Backend](./emsp-backend/README.md): The Backend of the e-Mobility Service Provider which signs contract certificates.


## 2. Requirements

The backend services have the following requirements:

- **Hardware**: ARM or x86 CPU with at least 2GB RAM
- **Operating System**: Debian 12 or Ubuntu 22.04 (64-bit)


## 3. Setup

This section describes how to install the backend services.

1. Install [Docker](https://docs.docker.com/engine/install/debian/).
2. Clone [this repository](https://github.com/uni-tue-kn/ev-pnc-oidc) and move into the cloned `servers` directory:
```bash
git clone https://github.com/uni-tue-kn/ev-pnc-oidc.git
cd ev-pnc-oidc/servers
```
3. Set configuration as described in [4. Configuration](#4-configuration).
4. Execute services:
```bash
docker compose up
```


## 4. Configuration

This section describes how to configure the servers.


### 4.1. Basic Configuration

1. In the `/secrets` directory, create a text file `.env`. **This directory will be excluded from versioning because it may contain secrets!**
2. In the created `.env` file, add the following environment variables:
```bash
EMSP_BACKEND_DOMAIN=[YOUR_EMSP_BACKEND_DOMAIN]
USER_AGENT_DOMAIN=[YOUR_USER_AGENT_DOMAIN]
AUTHORIZATION_SERVER_DOMAIN=[YOUR_AUTHORIZATION_SERVER_DOMAIN]
TRUSTED_AUDIENCE=[YOUR_USER_AGENT_CLIENT_ID]
```

*An example of the `.env` file is provided in  [`example.env`](./example.env).*


### 4.2. Authorization Server Configuration

This project relies on the [Authlete](https://www.authlete.com/) Authorization Server API.
To make use of it, you must create an [Authlete account](https://so.authlete.com/accounts/signup) to continue with the following steps.

1. Sign in to the [Authlete Service Owner Console](https://so.authlete.com/services).
2. Create a service and configure it as described in [4.2.1. Service Configuration](#421-service-configuration).
3. Go to the [Client Application Developer Console](https://cd.authlete.com/<your-service-api-key>) and sign in with your API Key (username) and API Secret (password).
4. Create an app and configure it as described in [4.2.2. Client Configuration](#422-client-configuration).
5. In the `.env` file, add the following environment variables:
```bash
AUTHLETE_API_KEY=[YOUR_SERVICE_API_KEY]
AUTHLETE_API_SECRET=[YOUR_SERVICE_API_SECRET]
AUTHLETE_CLIENT_ID=[YOUR_APP_CLIENT_ID]
AUTHLETE_CLIENT_SECRET=[YOUR_APP_CLIENT_SECRET]
```


### 4.2.1. Service Configuration

TODO


### 4.2.2. Client Configuration

TODO


### 4.3. ACME Configuration

This project uses the Traefik reverse proxy to obtain valid TLS certificates via an Automatic Certificate Management Environment (ACME).
Therefore, a DNS challenge from the [Let's Encrypt](https://letsencrypt.org/de/) certificate authority is used.
This requires Traefik to access the DNS API of the DNS provider.
We use the [INWX](https://www.inwx.de) DNS provider for that.

If you want to change the ACME challenge type, the certificate authority, or the DNS provider, you must adjust the [`docker-compose.yaml`](./docker-compose.yaml) file following [this documentation guidelines](https://doc.traefik.io/traefik/https/acme/).

If you use Let's Encrypt with a DNS Challenge at INWX, follow this guide to grant Traefik access to the DNS API of INWX:

1. In the `/servers` directory, create a directory named `.secrets`. **This directory will be excluded from versioning because it will contain secrets!**
2. In the `./secrets` directory, create the following text files:
  - `inwx_username.txt`: Enter your INWX username here.
  - `inwx_password.txt`: Enter your INWX password here.
  - `inwx_secret.txt`: Enter the TOTP seed here, if MFA is active.
3. To get notified by Let's Encrypt on expiring certificates, add your email address to the [`.env`](./.env) file:
```bash
LETS_ENCRYPT_EMAIL=[YOUR_EMAIL_ADDRES]
```
