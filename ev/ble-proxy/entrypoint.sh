#!/bin/bash

# Start dbus service
echo "Starting dbus service..."
/etc/init.d/dbus start

# Start Bluetooth daemon in background
echo "Starting Bluetooth daemon..."
/usr/libexec/bluetooth/bluetoothd --debug &

# Start GATT server
echo "Starting GATT server..."
python3 ./gatt_server.py
