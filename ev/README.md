# Electric Vehicle (EV)

The software running on the Electric Vehicle.
The software is tested on a Raspberry Pi 5.
It is not developed with focus on implementation security.
**Do not use it for production environments!**


## 1. Services Overview

- [EV Backend](./ev-backend/README.md): The server on the EV which requests contract certificates via the User Agent.
- [BLE Proxy](./ble-proxy/README.md): The Bluetooth Low Energy Server which proxies Bluetooth requests to the EV Backend.


## 2. Requirements

- **Hardware**: [Raspberry Pi 5](https://www.raspberrypi.com/products/raspberry-pi-5/) + 32 GB MicroSD card
- **Operating System**: [Raspberry Pi OS Lite 64-bit](https://www.raspberrypi.com/software/)


## 3. Setup

1. Use the [Raspberry Pi Imager](https://github.com/raspberrypi/rpi-imager) to format the MicroSD card with [Raspberry Pi OS Lite (64-bit)](https://www.raspberrypi.com/software/operating-systems/).
2. Run the [`setup.sh`](./setup.sh) script which will update the Raspberry Pi's software and firmware and install the [Docker Community Edition](https://docs.docker.com/engine/install/debian/):
```bash
bash <(https://raw.githubusercontent.com/uni-tue-kn/ev-pnc-oidc/main/ev/setup.sh)
```
3. Reboot the device:
```bash
sudo reboot
```
4. Clone [this repository](https://github.com/uni-tue-kn/ev-pnc-oidc) and move into the cloned `ev` directory:
```bash
git clone https://github.com/uni-tue-kn/ev-pnc-oidc.git
cd ev-pnc-oidc/ev
```
5. Configure the environment as described in [3.1. Configuration](#31-configuration).
6. Execute the EV software:
```bash
./run.sh
```


### 3.1. Configuration

1. In the `/ev` directory, create a `.env` file.
2. Set the following environment variables in the `.env` file:
```bash
EV_BACKEND_DOMAIN=[YOUR_INTERNAL_EV_BACKEND_DOMAIN]
EMSP_BACKEND_DOMAIN=[YOUR_EMSP_BACKEND_DOMAIN]
```
*An example for the `.env` file is provided in [`example.env`](./example.env).*
3. Configure the eMSPs of the EV Backend as described [here](./ev-backend/README.md#121-emsp-configuration).
