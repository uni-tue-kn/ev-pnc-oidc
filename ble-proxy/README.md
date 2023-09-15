# BLE Proxy

## Documentation

Execute the following command in the repository's root directory to build the container and run it interactively:

```bash
sudo killall -9 bluetoothd

# Build the container as "ble-proxy:latest" image
docker build --pull --rm -f "ble-proxy/Dockerfile" -t ble-proxy:latest "ble-proxy"
docker run --privileged --net=host -it --volume="$PWD"/../:/usr/src/app --entrypoint /bin/bash ble-proxy:latest

cd ble-proxy/
bash entrypoint.sh
```
