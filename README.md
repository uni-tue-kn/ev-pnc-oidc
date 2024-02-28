# Plug'n'Charge with OAuth 2

This repository is part of a joined project between [Eberhard Karls Universität Tübingen](https://uni-tuebingen.de) and [Hochschule Darmstadt](https://h-da.de) to improve the [Plug & Charge](https://de.wikipedia.org/wiki/ISO_15118) authorization with [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749).


## 1. Project Overview

- [Formal proof analysis](./Tamarin/README.md) of the protocol with Tamarin.
- [Servers](./servers/README.md): The servers hosted on the Internet.
  - [User Agent](./servers/user-agent/README.md): The user's application on the smartphone. Used to authorize the EV for charging.
  - [eMSP Authorization Server](./servers/emsp-as/README.md): The Authorization Server of the e-Mobility Service Provider.
  - [eMSP Backend](./servers/emsp-backend/README.md): The Backend of the e-Mobility Service Provider which signs contract certificates.
- [Electric Vehicle](./ev/README.md): The software running on the Electric Vehicle.
  - [EV Backend](./ev/ev-backend/README.md): The server on the EV which requests contract certificates via the User Agent.
  - [BLE Proxy](./ev/ble-proxy/README.md): The Bluetooth Low Energy Server which proxies Bluetooth requests to the EV Backend.


## 2. Documentation

A detailed communication flow is described [here](./docs.md).
