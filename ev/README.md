# Electric Vehicle (EV)

The software running on the Electric Vehicle.
The software is tested on a Raspberry Pi 5.


## Requirements

- **Hardware**: [Raspberry Pi 5](https://www.raspberrypi.com/products/raspberry-pi-5/) + 32 GB MicroSD card
- **Operating System**: [Raspberry Pi OS Lite 64-bit](https://www.raspberrypi.com/software/)


## Setup

1. Use the [Raspberry Pi Imager](https://github.com/raspberrypi/rpi-imager) to format the MicroSD card with [Raspberry Pi OS Lite (64-bit)](https://www.raspberrypi.com/software/operating-systems/).
2. Run the [`setup.sh`](./setup.sh) script which will update the Raspberry Pi's software and firmware and install the [Docker Community Edition](https://docs.docker.com/engine/install/debian/):
```bash
bash <(https://raw.githubusercontent.com/uni-tue-kn/ev-pnc-oidc/main/ev/setup.sh)
```
3. Clone [this repository](https://github.com/uni-tue-kn/ev-pnc-oidc) and move into the cloned `ev` directory:
```bash
git clone https://github.com/uni-tue-kn/ev-pnc-oidc.git
cd ev-pnc-oidc/ev
```
4. Execute EV software:
```bash
docker-compose up
```
