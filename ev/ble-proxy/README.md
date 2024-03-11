# BLE Proxy

## Documentation

Execute the following command in the repository's root directory to build the container and run it interactively:

```bash

# Build the container as "ble-proxy:latest" image
docker build --pull --rm -f "Dockerfile" -t ble-proxy:latest .

sudo killall -9 bluetoothd
docker run --privileged --net=host -it --volume="$PWD"/../:/usr/src/app --entrypoint /bin/bash ble-proxy:latest

cd ble-proxy/
bash entrypoint.sh
```
