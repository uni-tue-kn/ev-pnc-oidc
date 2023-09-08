#!/bin/bash

DEVICE_NAME="MyEV"

# Start dbus service
systemctl start dbus.service
systemctl start bluetooth.service
systemctl start flowbleadv.service
systemctl start flowble.service

# Configure BLuetooth
btmgmt -i hci0 power off 
btmgmt -i hci0 le on
btmgmt -i hci0 connectable on
btmgmt -i hci0 name "${DEVICE_NAME}"
btmgmt -i hci0 bredr off
btmgmt -i hci0 advertising on
btmgmt -i hci0 power on
