# Manylabs Flow BLE Design and Implementation Notes

## Intro

This document describes the flow-ble design and will capture some of the experiments/implementation
notes and other information pertinent to design decisions.

## Initial Tests

### rfcomm Test

On rpi:

```bash
sdptool add --channel=22 SP
sudo rfcomm listen /dev/rfcomm0 22
```
You'll see something like this:

```
Waiting for connection on channel 22
```

On client (e.g. a Ubuntu laptop):

see 
https://unix.stackexchange.com/questions/92255/how-do-i-connect-and-send-data-to-a-bluetooth-serial-port-on-linux

### GATT BLE Tests

For test of RasPi BLE server, see (ml-ble-test/README)[ml-ble-test/README]

## Design

This is the configuration of BLE manylabs deployment:

Raspberry PI	 -> Browser/laptop/tablet 	->	Server

Raspberry PI serves as BLE Peripheral. It has the server role that provide GATT services. 
It also advertises that the BLE peripheral device with Manylabs flow service is available.
Browser hosting a page accesses Raspberry PI and is in Central role, it also has the client role since it's a consumer of GATT services.
Browser hosting a page that accesses BLE peripheral via Web Bluetooth has to load from the server using https protocol.

### Additional Design Notes

Note: although we are going to use a Python based approach via dbus, the 
notes below will be kept here for historical purposes.


Similar/related projects and libaries:

We need to serve multiple block values periodically

* This shows how Nuimo service offers 13-byte "LED Characteristic". (python using Adafruit_BluefruitLE library)
https://github.com/AravinthPanch/nuimo-bluetooth-low-energy-python

* Experimental Bluez GATT service
 shows how to advertise custom profile and implement gatt server in Python
https://github.com/MostTornBrain/Waterrower

* pygatt - Python Module for Bluetooth LE Generic Attribute Profile (GATT).
 * https://github.com/stratosinc/pygatt
 * https://pypi.python.org/pypi/pygatt
 * doesn't use dbus
 * 
 * active since 2013, about 4500 lines of code
 * uses a c helper process - stardard tool gatttool which is part of bluez distribution
	which is accessed via pipe from Python be sending commands, such as
	./pygatt/backends/gatttool/gatttool.py
	the process is started once, so pipe communication should be fast

* Bluetooth GATT SDK for Python
 * python3 required
 * https://github.com/getsenic/gatt-python
 * uses dbus

* pygattlib
 * https://bitbucket.org/OscarAcena/pygattlib
 * python2 or 3

```
- uses dbus for implementation, core code is about 1500 lines:
wc bluepy/*.py
       4      16     115 bluepy/__init__.py
     140     448    4698 bluepy/blescan.py
     734    2277   25754 bluepy/btle.py
     201     418    5760 bluepy/get_services.py
     498    1437   16504 bluepy/s
```

* bluepy Python interface to Bluetooth LE on Linux
 * python gatt library (doesn't include gatt peripheral support yet)
 * https://github.com/IanHarvey/bluepy
 * doesn't use dbus
 * uses a c helper process custom writte ./bluepy/bluepy-helper.c
	which is accessed via pipe from Python be sending commands, such as
	the process is started once, so pipe communication should be fast


```
- core code is about 500 lines:
wc ./gatt/gatt_linux.py
     594    1632   21977 ./gatt/gatt_linux.py
```

* bluez for Linux contains C and Python code example of a gatt server and tools that allow to advertise services 
 * ./tools/tools/btgatt-server.c (C)
 * ./test/example-gatt-server (Python)
 * ./test/example-advertisement (Python)

## Changes Required in the Deployment

* Server has to serve via https, since that's a requirement for Web BTE
 e.g. dataflow.manylabs.org production server, or local dev server normally running on non-secure port localhost:5000) 

## Manylabs flow/blocks GATT profile

See GATT-PROFILE

### GATT BLE Flow Integration

#### Intro

Flow daemon currently provides upload data to the server.

How do we implement communication between flow daemon and flow-ble which may run in another process?

Although there are other approaches possible, we decided to provide a clean and de-coupled approach
to communication between flow daemon and flow-ble module via MQTT.

This steers the implementation on RasPi towards a robust microservices architecture. 
It also:

* allows to have more flexibility in phased implementation of flow-ble, first in C (which is readily available with working samples in bluez),
and eventually in Python, if necessary
* allows for a robust communication bus of different components as they evolve
* allows elegant store of history data and other data via a store layer that subscribes to an MQTT topic

#### Flow-Client to BLE Data Flow

We are using MQTT service. This is how it works

* Real time block data is published by Flow to an MQTT topic 
* flow-ble subscribes to the topic and serves the data to BLE client/Central/bluetooth-web app as it appears in MQTT

## Other Changes Recommended for the Deployment and Data Flow

Since Web BLE supports discovery, manylabs dataflow setup can be simplified by allowing
manylabs browser UI to perform the discovery of rpi, then saving it in the configuration.
Another feature could be to make manually inserting PIN on the server after running flow on rpi for the first time un-necessary.

