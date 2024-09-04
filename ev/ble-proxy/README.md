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
The typical error output is:
```bash
ble-proxy-1   | Traceback (most recent call last):
ble-proxy-1   |   File "/app/./gatt_server.py", line 308, in <module>
ble-proxy-1   |     loop.run_until_complete(run(loop=loop))
ble-proxy-1   |   File "/usr/local/lib/python3.12/asyncio/base_events.py", line 687, in run_until_complete
ble-proxy-1   |     return future.result()
ble-proxy-1   |            ^^^^^^^^^^^^^^^
ble-proxy-1   |   File "/app/./gatt_server.py", line 213, in run
ble-proxy-1   |     await server.add_new_service(HPS_SERVICE_UUID)
ble-proxy-1   |   File "/usr/local/lib/python3.12/site-packages/bless/backends/bluezdbus/server.py", line 146, in add_new_service
ble-proxy-1   |     await self.setup_task
ble-proxy-1   |   File "/usr/local/lib/python3.12/site-packages/bless/backends/bluezdbus/server.py", line 65, in setup
ble-proxy-1   |     potential_adapter: Optional[ProxyObject] = await get_adapter(
ble-proxy-1   |                                                ^^^^^^^^^^^^^^^^^^
ble-proxy-1   |   File "/usr/local/lib/python3.12/site-packages/bless/backends/bluezdbus/dbus/utils.py", line 79, in get_adapter
ble-proxy-1   |     adapter_path: str = await find_adapter(
ble-proxy-1   |                         ^^^^^^^^^^^^^^^^^^^
ble-proxy-1   |   File "/usr/local/lib/python3.12/site-packages/bless/backends/bluezdbus/dbus/utils.py", line 59, in find_adapter
ble-proxy-1   |     raise Exception(f"No adapter named {adapter} found")
ble-proxy-1   | Exception: No adapter named hci0 found
```

To fix this, stop the container:
```bash
docker compose down ble-proxy
```
Then, run the following command on your host to stop the Bluetooth daemons on your host:
```bash
sudo killall -9 bluetoothd
```
Now, restart the container:
```bash
docker compose up ble-proxy
```

If the error still persists, stop the container, reboot the host, kill the Bluetooth Daemon, and restart the container:
```bash
docker compose down ble-proxy
sudo reboot
sudo killall -9 bluetoothd
docker compose up ble-proxy
```

If the error still persists, the problem might be a driver issue.
To solve it, stop the container, update the host, reboot the host, kill the Bluetooth Daemon, and restart the container:
```bash
docker compose down ble-proxy
sudo apt update && sudo apt upgrade -y
sudo reboot
sudo killall -9 bluetoothd
docker compose up ble-proxy
```

If the error still persists, ensure that the Bluetooth interface is activated on your host and that the issue is not caused by a hardware problem.


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
