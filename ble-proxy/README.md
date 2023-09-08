# BLE Proxy

## Documentation

Execute the following command in the repository's root directory to build the container and run it interactively:

```bash
# Build the container as "ble-proxy:latest" image
docker build --pull --rm -f "ble-proxy/Dockerfile" -t ble-proxy:latest "ble-proxy"
docker run --privileged -it ble-proxy:latest /bin/bash
```
