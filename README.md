# EV PnC with OIDC

This repository is part of a joined project between [Eberhard Karls Universität Tübingen](https://uni-tuebingen.de) and [Hochschule Darmstadt](https://h-da.de) to improve the [Plug & Charge](https://de.wikipedia.org/wiki/ISO_15118) authorization with [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) and [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html).


## Documentation

A detailed communication flow is described [here](./docs.md).


## Project State

- User Agent: finished, not tested
- EV Backend: finished, not tested
- eMSP Authorization Server: not finished
- eMSP Backend: finished, tested


## Projects

- [User Agent](./user-agent/README.md): The user's application on the smartphone. Used to authorize the EV for charging.
- [EV Backend](./ev-backend/README.md): The server on the EV which requests contract certificates via the User Agent.
- [eMSP Authorization Server](./emsp-as/README.md): The Authorization Server of the eMSP.
- [eMSP Backend](./emsp-backend/README.md): The Backend of the eMSP which signs contract certificates.
