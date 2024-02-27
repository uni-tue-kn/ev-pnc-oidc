# Flow BLE Module 

* Design: [BLE-design](BLE-design.md)
* GATT Custom Profile Specification: Work in progress

## Pre-Requisites and Setup

On Raspian, the functionality as described below required an upgrade to the latest kernel kernel 1.20170427
and may only partially work with older Raspian version.

Also, BLE functionality was developed and tested on Ubuntu  16.04.1 with kernel as shown below
and should work.

```bash
uname -a
Linux peter-u16 4.4.0-75-generic #96-Ubuntu SMP Thu Apr 20 09:56:33 UTC 2017 x86_64 x86_64 x86_64 GNU/Linux
peter@peter-u16:~$ cat /etc/issue
Ubuntu 16.04.1 LTS \n \l
```

### Flow Integration Setup 

Setup MQTT:

```bash
sudo apt-get install mosquitto mosquitto-clients
# install mqtt python library for python2 and python3
sudo pip2 install paho-mqtt
sudo pip3 install paho-mqtt
```

Note: if pip3 fails, you may need to do the following update:

```bash
sudo pip3 install --upgrade setuptools
```

GATT server is dependent on paho-mqtt and yaglib. To install dependencies:

```bash
pip3 install -r gattserver/requirements.txt
```

## Setting Up Bluetooth

Assuming an older stock version of Bluetooth is already installed on your system,
you'll build a more recent version (bluez-5.44) and since it's experimental,
modify the service settings to start the new version instead of the old one.

Alternatively, you could perform "sudo make install" after building to replace
the old bluez.


### Download bluez and Build

* download a recent bluez. We used bluez v5.44
  http://www.kernel.org/pub/linux/bluetooth/bluez-5.44.tar.xz

* untar and build with --enable-experimental

```bash
mkdir -p ~/download
cd ~/download
tar zxvf bluez-5.44.tar.xz
cd bluez-5.44
./configure --prefix=/usr --mandir=/usr/share/man --sysconfdir=/etc --localstatedir=/var --disable-systemd --enable-experimental --enable-maintainer-mode
make
```  

* Modify service startup settings:

```bash
sudo vi /etc/systemd/system/bluetooth.target.wants/bluetooth.service

# modify the line below to point the the newly build bluetoothd
#  and use -E (experimental options) to start it

#ExecStart=/usr/lib/bluetooth/bluetoothd
ExecStart=/home/pi/download/bluez-5.44/src/bluetoothd -E
```

* Verify bluetooth still works and experimental mode is working properly

### Verify bluetooth still works 


#### Initializing BLE

Note: the "Disables BR/EDR" command below is not necessary on RasPi
but is needed if developing and testing on other platforms, such as Ubuntu x86_64

```bash
btmgmt -i hci0 power off 
btmgmt -i hci0 le on
btmgmt -i hci0 connectable on
# Set alias. This only needs to be done once
btmgmt -i hci0 name "Manylabs BLE"

# this line is necessary for some BT chipsets, otherwise gatt server will not
# receive connections
# see http://stackoverflow.com/questions/27552644/bluetooth-low-energy-android-gatt-client-connect-to-linux-gatt-server
btmgmt -i hci0 bredr off        # Disables BR/EDR !
btmgmt -i hci0 advertising on
btmgmt -i hci0 power on
```


## Install Manylabs BLE Service (flow-ble)

Aassuming flow-ble source has been installed in /home/pi/flow-ble via

```bash
git clone https://github.com/manylabs/flow-ble
```

you will execute these commands to copy ble and advertisement service to service location and 
to enable the service:

```bash
sudo cp -i /home/pi/flow-ble/gattserver/flowble.service /etc/systemd/system/
sudo cp -i /home/pi/flow-ble/gattserver/flowbleadv.service /etc/systemd/system/
sudo systemctl enable flowbleadv.service 
sudo systemctl enable flowble.service 
```

This will allow flowble to start on boot. You can skip the "systemctl enable" if
you don't want the service to be started automatically at boot time.

## Verify flow-ble Service Works

To verify/test using Web Bluetooth, navigate to local or public flowble test URL.
For local, you must have setup and started a local server via:


```bash

```


## Starting and Stopping the Service

We can use stardard Linux commands (running as root):

```bash
systemctl start flowble.service
systemctl status flowble.service
systemctl stop flowble.service
```

or

```bash
service flowble start
service flowble status
service flowble stop
```

Here are some examples of starting and stopping flowble service and querying the status.

```bash
systemctl status flowble.service
● flowble.service - Manylabs Flow BLE Service
   Loaded: loaded (/etc/systemd/system/flowble.service; disabled)
   Active: inactive (dead)
$ sudo systemctl start flowble.service
$ systemctl status flowble.service
● flowble.service - Manylabs Flow BLE Service
   Loaded: loaded (/etc/systemd/system/flowble.service; enabled)
   Active: active (running) since Mon 2017-05-15 14:28:01 PDT; 8min ago
 Main PID: 2153 (python3)
   CGroup: /system.slice/flowble.service
           └─2153 python3 /home/pi/flow-ble/gattserver/hpserver.py
$ sudo systemctl stop flowble.service
$ systemctl status flowble.service
● flowble.service - Manylabs Flow BLE Service
   Loaded: loaded (/etc/systemd/system/flowble.service; disabled)
   Active: inactive (dead)
```

flowbleadv service on which flowble service depends can be restarted separately as well.
Note that flowbleadv restart will cause also flowble restart since that how 
service dependency chain gets handled by systemctl.

```bash
systemctl restart flowbleadv.service
systemctl status flowbleadv.service
● flowbleadv.service - Manylabs Flow BLE Service Advertisement
   Loaded: loaded (/etc/systemd/system/flowbleadv.service; enabled)
   Active: active (running) since Mon 2017-05-15 14:27:36 PDT; 5min ago
 Main PID: 2122 (python3)
   CGroup: /system.slice/flowbleadv.service
           └─2122 python3 /home/pi/flow-ble/gattserver/hpadvertise.py
```
           
## Testing


### Test via github.io webpages

On a Chrome browser that supports a recent Web Bluetooth spec (e.g. Chrome 5.7+ on Mac OSX),
load this page:

https://manylabs.github.io/flow-ble/ml-ble-test/

This web app tests the use of the Web Bluetooth API for getting sensor data from Manylabs RasPi device
using HPS standard GATT service, with websocket extension specific to Manylabs.


After selecting device, if flowble service is running and processing data from flow, you'll 
something like this in your browser.

```
06:39:51: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:52: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:53: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:54: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:55: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:56: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:58: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:58: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:39:59: {"type":"ping","parameters":{}}
06:39:59: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:00: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:01: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:02: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:03: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:04: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:05: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:06: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
06:40:07: {"type":"sensor_update","parameters":{"values":[21.0],"name":"light"}}
```

### Run Webapp Locally

Alternatively, you can run ml-ble-test locally. Start serving from app directory, e.g. like this:

```bash
./httpsserver.py 
```

Then navigate to https://localhost:4443/.




## Troubleshooting

### Startup

The error below at startup of HPS server indicates a version mismatch for bluetooth daemon
or bluetoothd not running with experimental option. Make sure the correct
build > 5.44 is running with option "-E". 
(This show manual running of hpserver rather than via flowble service.

```
./hpserver.py 
Traceback (most recent call last):
  File "./hpserver.py", line 141, in <module>
    main()
  File "./hpserver.py", line 133, in main
    man = GattManager()
  File "/home/peter/git-clones/flow-ble/gattserver/yaglib/yaglib.py", line 321, in __init__
    self.bus.get_object(BLUEZ_SERVICE_NAME, self.adapter),
  File "/usr/lib/python3/dist-packages/dbus/bus.py", line 241, in get_object
    follow_name_owner_changes=follow_name_owner_changes)
  File "/usr/lib/python3/dist-packages/dbus/proxies.py", line 244, in __init__
    _dbus_bindings.validate_object_path(object_path)
TypeError: validate_object_path() argument 1 must be str, not None
```

To query bluetoothd version:

```
./src/bluetoothd --version
5.44
```

The error below at startup of Advertisement server indicates bluetooth daemon is not running.

```
Failed to register advertisement: org.bluez.Error.Failed: Failed to register advertisement
```

### Enable Verbose

You can enable verbose in hpserver.py and bluetoothd like this:

* in bluetoothd, enable option -d via
  * edit configuration to contain this line
  * .../bluetoothd -dE
  * vi /etc/systemd/system/bluetooth.target.wants/bluetooth.service 
* in hpserver.py
 #verboseLevel = 0
 verboseLevel = 2

daemon.log when running as a service and stdout if running in dev mode
will give information about what's failing

### Logs

If there is a problem, daemon.log can give clues.
The trace below shows normal operation of the bluetooth daemon and flowble and flowbleadv daemons.

Sample daemon.log after starting Bluetooth service.

```bash
pi@raspberrypi:~ $ sudo systemctl start bluetooth
pi@raspberrypi:~ $ tail /var/log/daemon.log
May  7 10:22:44 raspberrypi systemd[1]: Started Bluetooth service.
May  7 10:22:44 raspberrypi dbus[442]: [system] Activating via systemd: service name='org.freedesktop.hostname1' unit='dbus-org.freedesktop.hostname1.service'
May  7 10:22:44 raspberrypi bluetoothd[2231]: Bluetooth management interface 1.14 initialized
May  7 10:22:44 raspberrypi systemd[1]: Starting Hostname Service...
May  7 10:22:44 raspberrypi systemd[1]: Failed to reset devices.list on /system.slice: Invalid argument
May  7 10:22:44 raspberrypi bluetoothd[2231]: Endpoint registered: sender=:1.17 path=/MediaEndpoint/A2DPSource
May  7 10:22:44 raspberrypi bluetoothd[2231]: Endpoint registered: sender=:1.17 path=/MediaEndpoint/A2DPSink
May  7 10:22:44 raspberrypi systemd-hostnamed[2235]: Warning: nss-myhostname is not installed. Changing the local hostname might make it unresolveable. Please install nss-myhostname!
May  7 10:22:44 raspberrypi dbus[442]: [system] Successfully activated service 'org.freedesktop.hostname1'
May  7 10:22:44 raspberrypi systemd[1]: Started Hostname Service.
```

Sample daemon.log after starting flowble service.

```bash
pi@raspberrypi:~ $ sudo systemctl start flowble
pi@raspberrypi:~ $ tail /var/log/daemon.log
...
May  7 10:25:38 raspberrypi systemd[1]: [/etc/systemd/system/flowbleadv.service:4] Failed to add dependency on flowbleadv, ignoring: Invalid argument
May  7 10:25:38 raspberrypi systemd[1]: Starting Manylabs Flow BLE Service Advertisement...
May  7 10:25:38 raspberrypi systemd[1]: Started Manylabs Flow BLE Service Advertisement.
May  7 10:25:38 raspberrypi systemd[1]: Starting Manylabs Flow BLE Service...
May  7 10:25:38 raspberrypi systemd[1]: Started Manylabs Flow BLE Service.
```

Verify the required processes are running.
After services have been started properly, you should see the 3 lines below
in "ps" command output.

```bash
# search for relevant processes
ps aux  | grep -v grep |egrep "hpadvertise|hpserver|bluetoothd"
root       753  0.0  0.3   4852  3408 ?        Ss   14:14   0:00 /home/pi/download/bluez-5.44/src/bluetoothd -E
root      2122  1.4  1.3  28032 12624 ?        Ssl  14:27   0:00 python3 /home/pi/flow-ble/gattserver/hpadvertise.py
root      2153 10.0  1.4  39204 14036 ?        Ssl  14:28   0:00 python3 /home/pi/flow-ble/gattserver/hpserver.py
```

You can also use systemctl list-units or status to view relevant services.
Note: flow.service will be seen on newer versions of flow after May 20 commits

```bash
systemctl list-units|grep -i Manylabs
flow.service            loaded active running   Manylabs Flow Service
flowble.service         loaded active running   Manylabs Flow BLE Service
flowbleadv.service      loaded active running   Manylabs Flow BLE Service Advertisement

# show status for all flow services
systemctl status 'flow*' 
● flow.service - Manylabs Flow Service
   Loaded: loaded (/etc/systemd/system/flow.service; enabled)
   Active: failed (Result: start-limit) since Sat 2017-05-20 14:24:29 PDT; 1min 10s ago
  Process: 20869 ExecStart=/home/pi/flow/flowservice.sh (code=exited, status=1/FAILURE)
 Main PID: 20869 (code=exited, status=1/FAILURE)

● flowble.service - Manylabs Flow BLE Service
   Loaded: loaded (/etc/systemd/system/flowble.service; enabled)
   Active: active (running) since Sat 2017-05-20 14:08:21 PDT; 17min ago
 Main PID: 19982 (python3)
   CGroup: /system.slice/flowble.service
           └─19982 python3 /home/pi/flow-ble/gattserver/hpserver.py

● flowbleadv.service - Manylabs Flow BLE Service Advertisement
   Loaded: loaded (/etc/systemd/system/flowbleadv.service; enabled)
   Active: active (running) since Thu 2017-05-18 18:41:22 PDT; 1 day 19h ago
 Main PID: 6650 (python3)
   CGroup: /system.slice/flowbleadv.service
           └─6650 python3 /home/pi/flow-ble/gattserver/hpadvertise.py
```

## Performance

This trace on the client using manylabsble.js library shows the following:

* Initial delay between GET request and "data ready notification" via http_status is about 300ms
* For websocket push, turn-around time is about 340ms between receiving "new data available" and completing data retrieval.
  Plus there is some delay for each turn-around since notify transport probably takes 100-200ms, so 
  the total is about 500ms

This could be improved by pushing data directly in websocket mode instead of sending http_status notify first.
That would reduce latency from when data becomes available on raspi and the time the client recieves it by
about 20-30%.

Trace of JavaScript (Chrome dev tool): Initial GET request to "notification received" trace (about 500ms)

```
18:16:59.075 manylabsble.js:179 requestGet
18:16:59.345 app.js:45 handleHttpStatus.event characteristicvaluechanged
18:16:59.354 app.js:58 handleHttpStatus.event: Retrieving body...
```

Trace of JavaScript (Chrome dev tool): Websocket pushing data via write http_status notification and body retrieval completion (about 340ms)

```
18:18:39.521 app.js:45 handleHttpStatus.event characteristicvaluechanged
18:18:39.532 app.js:58 handleHttpStatus.event: Retrieving body...
18:18:40.055 app.js:60 getHttpBody.body: {"timestamp":"2017-05-04T01:38:00.336090Z","type":"sensor_update","parameters":{"values":[12.0],"name":"light"}}
18:18:41.472 app.js:45 handleHttpStatus.event characteristicvaluechanged
18:18:41.473 app.js:58 handleHttpStatus.event: Retrieving body...
18:18:41.810 app.js:60 getHttpBody.body: {"timestamp":"2017-05-04T01:38:00.336090Z","type":"sensor_update","parameters":{"values":[12.0],"name":"light"}}
18:18:44.006 app.js:45 handleHttpStatus.event characteristicvaluechanged
18:18:44.008 app.js:58 handleHttpStatus.event: Retrieving body...
18:18:44.308 app.js:60 getHttpBody.body: {"timestamp":"2017-05-04T01:38:00.336090Z","type":"sensor_update","parameters":{"values":[12.0],"name":"light"}}
```

