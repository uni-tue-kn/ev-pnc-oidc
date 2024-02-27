## Manylabs Device Service Requirements

- Manylabs Service Discovery
- Device Information Service Discovery
- (not implemented for now): Battery Service Discovery

Characteristic Discovery


### Manylabs Flow Info Service

Flow Info Service provides information that will be useful for automating the
process of setting up a new RasPi device from a browser:

* flow_pin
  * access: Read
  * Description: Allows reading of PIN from a newly installed flow service

* wifi_ssid
  * access: Read
  * Description: wifi ssid to connect to
  * Note: this is low priority future feature

* wifi_password
  * access: Read
  * Description: password for wifi to connect to
  * Note: this is low priority future feature. There is a security concern
 that should be properly resolved



### Manylabs Realtime Service

The realtime services will provide reporting of current value of one or more sensors.

This service will use some of the patterns used in existing standard GATT profiles, such as Heart Rate Profile

See:

* https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.heart_rate.xml
* https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.heart_rate_measurement.xml

Manylabs Realtime Service will offer the following characteristics:

* sensor_measurement
  * access: Notify
  * Description: This characteristic is used to send a sensor values measurements

* sensor_list
  * access: Read
  * Description: This characteristic allows to query which sensors are configured and available on RasPi 

* sensor_ctrl
  * access: Write
  * Description: The sensor Control Point characteristic is used to enable a Client to write control points to a Server to control behavior.
  * For example the following will be specified:
    * data reporting interval
    * sensors selected for reporting (a subset of all available sensors in sensor_list)
 
* sensor_status
 * access: Read, Notify
 * Description: Allow to query sensor status such as error condition on the sensor and 
  is also used to notify the client about change in sensor status


TODO:

* finalize need for homogeneous timestamps accross sensors
  - for now, the design assumes timestamps are identical accross sensors to 
    increase data throughput/efficiency for multipe sensors (e.g. all sensors report at 1 second interval or 1 minute interval)

### Manylabs HTTP Proxy Service

The history and block watch BLE support will use http_proxy standard GATT profile that allows http-like communication.
That will allow reuse of some of the current flow code and web app JavaScript that exchanges data as JSON.
This can be later optimized to use smaller payloads.

See:

* https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.http_proxy.xml
* https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=308344&_ga=1.265226703.1726630355.1492634329


TODO: 

* finalize local storage of sensor data on RasPI. Come up with a more efficient exchange of history so that number
  of requests can be minimized (http_proxy service and BLE in general has a limitation of 512 bytes per response)
