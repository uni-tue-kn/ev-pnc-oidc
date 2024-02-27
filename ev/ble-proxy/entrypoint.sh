#!/bin/bash

DEVICE_NAME="MyEV"

# Start dbus and bluetooth service
#service dbus start
/etc/init.d/dbus start
#service bluetooth start
/usr/libexec/bluetooth/bluetoothd -E &
sleep 1

# # Configure BLuetooth
 btmgmt -i hci0 power off 
 btmgmt -i hci0 le on
 btmgmt -i hci0 connectable on
 btmgmt -i hci0 pairable on
 btmgmt -i hci0 bondable on
# btmgmt -i hci0 fast-conn on
 btmgmt -i hci0 name "${DEVICE_NAME}"
 btmgmt -i hci0 bredr off
 btmgmt -i hci0 advertising on
 btmgmt -i hci0 power on
sleep 1

# # Start Custom services
#systemctl start flowbleadv.service
#systemctl start flowble.service
cd ..
cd flow-ble/gattserver/

#hcitool -i hci0 cmd 0x08 0x0008 12 11 07 9E CA DC 24 0E E5 A9 E0 93 F3 A3 B5 01 00 40 8E 00 00 00 00 00 00 00 00 00 00 00 00 00
hcitool -i hci0 cmd 0x08 0x0008 12 11 07 fb 34 9b 5f 80 00 00 80 00 10 00 00 23 18 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
hcitool -i hci0 cmd 0x08 0x0006 00 08 00 08 00 00 00 00 00 00 00 00 00 07 00
hcitool -i hci0 cmd 0x08 0x000A 01
sleep 1

python3 hpadvertise.py &
python3 hpserver.py

