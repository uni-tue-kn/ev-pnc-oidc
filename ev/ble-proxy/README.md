# BLE HTTP Proxy

An Bluetooth LE GATT HTTP Proxy Service to proxy HTTP requests via Bluetooth Low Energy.


## 1. Documentation

### 1.1. Requirements

The host device must run Linux and it must have a Bluetooth interface.
The proxy server should run in the Docker container with the default Bluetooth driver.
It was tested on a Raspberry Pi 4B with a plain Raspberry Pi OS Lite (x64) image.


### 1.2. Configuration

The eMSP Backend can be configured using the following environment variables:

**Device name `DEVICE_NAME`**
  The name advertised by the BLE server
  Default is `HTTP Proxy Service`.


## 2. Development

Docker commands:

```bash
# Build the container as "ev-backend:latest" image
docker build --pull --rm -f "Dockerfile" -t ble-proxy:latest "./"

# Run the built container.
docker run --privileged --net=host -it ble-proxy:latest
```

Docker Compose commands:

```bash
# Build the container as "ev-backend:latest" image
docker compose build ble-proxy

# Run the built container.
docker compose up ble-proxy
```


## 3. Troubleshooting

### 3.1. Bluetooth Server Fails to Start

If the Bluetooth server fails to start, this might be because your Bluetooth hardware is already occupied by your host's Bluetooth daemon.

To fix this, stop the container, and run the following command on your host to stop the Bluetooth daemons on your host:
```bash
sudo killall -9 bluetoothd
```
Now, restart the container.


### 3.2. Writing Characteristic Values Fails

If you fail writing GATT Characteristic values, stop the container then restart it using the following commands:

```bash
docker run --privileged --net=host -it --entrypoint=/bin/bash ev-ble-proxy:latest
```

Now, from within the container, use the following command to start the Bluetooth server manually:

```bash
./entrypoint.sh
```

If you still experience the characteristics to fail writing, cancel the execution of the Bluetooth server (CTRL + C) and execute the command again.
Repeat this procedure until it works.

If you still experience the issue, try the following recommendations:

- Turn Bluetooth on the client off and on
- Restart the client
- Restart the server
