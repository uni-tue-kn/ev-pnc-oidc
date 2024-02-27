#!/bin/bash

# Kill running Bluetooth daemon on host
sudo killall -9 bluetoothd

# Run containers
docker compose up
