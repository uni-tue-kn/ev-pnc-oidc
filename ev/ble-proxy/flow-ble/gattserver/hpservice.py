"""Manylabs http_proxy service (HPS).

Uses standard HTTP profile as defined here:

https://www.bluetooth.org/docman/handlers/downloaddoc.ashx?doc_id=308344&_ga=1.265226703.1726630355.1492634329
https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.http_proxy.xml

Individual Characteristics:
https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.uri.xml
https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_headers.xml
https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_status_code.xml
etc.

== Service and Characteristics Summary

Service:
UUID: 1823

Characteristics:

Name                Format  UUID    Mandatory Properties
----------------------------------------
URI                 utf8s   2ab6    Write, Write Long
HTTP Headers        utf8s   2ab7    Read, Write, Read Long, Write Long
HTTP Entity Body    utf8s   2ab8    Read, Write, Read Long, Write Long
HTTP Control Point  uint8   2ab9    Write
HTTP Status Code    uint8   2aba    Notify
HTTPS Security      boolean 2abb    Read

Characteristics class names/property nanes used in the implementation below:

class                   attribute
---------------------------------------
UriChrc                 uri
HttpHeadersChrc         http_headers
HttpEntityBodyChrc      http_entity_body
HttpControlPointChrc    http_control_point
HttpStatusCodeChrc      http_status_code
HttpSecurityChrc        https_security

== How it works

Here is the full execution sequence on the client:

* write uri
* (optional) write http headers
* (optional) write http_entity_body
* write http_control_point
* on notify http_status_code:
 * read http_entity_body

Here is a more limited the sequence flow-ble service will need:

* write uri
* write http_control_point
* on notify http_status_code:
 * if success: read http_entity_body



"""

import datetime
from array import array
from random import randint
import threading
import dbus
"""Implements http_proxy service
"""
# needed for timer scheduling
#try:
#  from gi.repository import GObject
#except ImportError:
#  import gobject as GObject
from gi.repository import GObject
from yaglib import Service, Characteristic, Descriptor

# set to 0 to disable all logging/tracing/printing
# 1: to allow only error printing
# 2: to allow both errors and info logging 
#verboseLevel = 0
verboseLevel = 2

# set flush for trace output to daemon.log
import functools
print = functools.partial(print, flush=True)

def log(message):
    if verboseLevel > 1:
        print(message)

def log_error(message):
    if verboseLevel > 0:
        print(message)

# http status code info
# https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_status_code.xml
STATUS_BIT_HEADERS_RECEIVED = 1
STATUS_BIT_HEADERS_TRUNCATED = 2
STATUS_BIT_BODY_RECEIVED = 4
STATUS_BIT_BODY_TRUNCATED = 8
# this bit is currently reserved for future use, we define it to indicate winsock operation
STATUS_EXTENDED_BIT_WEBSOCKET = 16

class HttpProxyService(Service):
    """http_proxy standard GATT profile/service. 

    Example:

    This service is used like this:
    * the server, when creating the service, specifies a custom callback
      for processing client requests
    * the client enables notifications on http_status_code characteristic
      so that it can receive replies via http_status_code notifications
    * the client writes URI
    * the client writes http_control_point
     * the service calls server implementation via the custom callback
     * the server implementation provides the data, it could be any data retrieval:
       in classical "proxy" sense it can perform an HTTP request to get the data,
       or it can retrieve data from a queue that is serviing the URI specified via
       uri characteristic
     * the server places the acquired data into http_entity_body characteristic
       for later retrieval by the client
     * the server sets http_status_code for notifications
     * now that data is ready, a notification is triggered on http_status_code characteristic
    * the client receives notification for http_status_code
    * the client retrieves the response body via read of http_entity_body characteristic

    Optional websocket support (this is not mention the the spec 
        but will not break non-winsock HttpProxy service):
    If request was websocket (i.e. scheme in URI was wss or ws), 
    the server may keep sending sending additional data via writing new values into http_entity_body
    and trigger additional notifications on http_status_code characteristic.
    In this case the client code is like above, except it will continue executing the last two 
    statement "receives notification" and retrieves the response body, in a continuous loop until
    it stops notifications.
    Care must be taken on the server side to handle writing new http_entity_body values too 
    quickly, e.g. the server may want to wait until http_entity_body has been read before
    changing it to new value.


    """
    # HPS service UUID as per spec
    SERVICE_UUID = '00001823-0000-1000-8000-00805f9b34fb'

    def __init__(self, bus, index, charc_rw_cb):
        """ctor.
        Args:
            charc_rw_cb: callback to call on control point write

              it has the signature charc_rw_cb(charc, read_or_write, options, value=None) where
              charc is haracteristic calling back (i.e. this instance of Characteristic)

        """
        Service.__init__(self, bus, index, self.SERVICE_UUID, True)
        # holds status between notification sent (read pending) and read done
        #   read_complete event
        self.read_event = threading.Event()
        self.read_event.clear()
        self.last_update_message = None
        self.last_update_ts = None
        self.last_large_body_ts = datetime.datetime.now()
        self.charc_rw_cb = charc_rw_cb
        self.http_uri_chrc = UriChrc(bus, 0, self)
        self.add_characteristic(self.http_uri_chrc)
        self.add_characteristic(HttpHeadersChrc(bus, 1, self))
        self.http_entity_body_chrc = HttpEntityBodyChrc(bus, 2, self)
        self.add_characteristic(self.http_entity_body_chrc)
        self.http_control_point_chrc = HttpControlPointChrc(bus, 3, self)
        self.add_characteristic(self.http_control_point_chrc)
        self.http_status_code_chrc = HttpStatusCodeChrc(bus, 4, self)
        self.add_characteristic(self.http_status_code_chrc)
        self.https_security_chrc = HttpSecurityChrc(bus, 5, self)
        self.add_characteristic(self.https_security_chrc)

    def cancel_request(self):
        """Adjust state if canceled. 
        This is not needed for this service and therefore is a noop."""
        pass 

class UriChrc(Characteristic):
    # https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.uri.xml
    CHRC_UUID = '00002ab6-0000-1000-8000-00805f9b34fb'

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['write'],
                service)
        self.notifying = False
        self.uri = ""

    def WriteValue(self, value, options):
        """Save uri locally.

        """
        self.uri = str(self.decode_to_string(value))
        log('UriChrc.WriteValue: self.uri=%s' % self.uri)


class HttpHeadersChrc(Characteristic):
    # https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_headers.xml
    CHRC_UUID = '00002ab7-0000-1000-8000-00805f9b34fb'

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['notify'],
                service)
        self.notifying = False
        self.http_headers = ""


class HttpEntityBodyChrc(Characteristic):
    CHRC_UUID = '00002ab8-0000-1000-8000-00805f9b34fb'

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['read'],
                service)
        self._http_entity_body = ""
        self.set_http_entity_body(self._http_entity_body)
        self.int_offset = 0

    def get_http_entity_body(self):
        return self._http_entity_body

    def set_http_entity_body(self, value):
        self._http_entity_body = value 
        if not value:
            self.http_entity_body_encoded = []
        else:
            #value = array('B', b'This is a characteristic for testing')
            if isinstance(self._http_entity_body, bytes):
                # if _http_entity_body is bytes, no need to encode
                self.http_entity_body_encoded = self._http_entity_body
            else:
                value = array('b')
                value.frombytes(self._http_entity_body.encode())
                value = value.tolist()
                self.http_entity_body_encoded = value 
        log("set_http_entity_body: self._http_entity_body=%s" % self._http_entity_body)
        log("set_http_entity_body: self.http_entity_body_encoded=%s" % self.http_entity_body_encoded)

    def ReadValue(self, options):
        """

        Trace info related to options:
            offset = options.get(dbus.String('offset'))[]
            HttpEntityBodyChrc.ReadValue: options=dbus.Dictionary({dbus.String('device'): dbus.ObjectPath('/org/bluez/hci0/dev_60_F8_1D_CD_D3_B7', variant_level=1), dbus.String('offset'): dbus.UInt16(103, variant_level=1)}, signature=dbus.Signature('sv'))
            ...
            HttpEntityBodyChrc.ReadValue: options=dbus.Dictionary({dbus.String('device'): dbus.ObjectPath('/org/bluez/hci0/dev_60_F8_1D_CD_D3_B7', variant_level=1), dbus.String('offset'): dbus.UInt16(412, variant_level=1)}, signature=dbus.Signature('sv'))

            ui = dbus.UInt16(103, variant_level=1)
            In [65]: ui.real
            Out[65]: 103

        bluez sends up to 102 characters at a time for long value reads (2nd read is at offset 103), 
        so there will be 5 reads for 512 character string

        So for example, these two invocations will be done by bluez system into this function to read 112 bytes:

            HttpEntityBodyChrc.ReadValue: options=dbus.Dictionary({dbus.String('device'): dbus.ObjectPath('/org/bluez/hci0/dev_60_F8_1D_CD_D3_B7', variant_level=1)}, signature=dbus.Signature('sv'))
            HttpEntityBodyChrc.ReadValue: [123, 34, 116, 105, 109, 101, 115, 116, 97, 109, 112, 34, 58, 34, 50, 48, 49, 55, 45, 48, 53, 45, 48, 52, 84, 48, 49, 58, 51, 56, 58, 48, 48, 46, 51, 51, 54, 48, 57, 48, 90, 34, 44, 34, 116, 121, 112, 101, 34, 58, 34, 115, 101, 110, 115, 111, 114, 95, 117, 112, 100, 97, 116, 101, 34, 44, 34, 112, 97, 114, 97, 109, 101, 116, 101, 114, 115, 34, 58, 123, 34, 118, 97, 108, 117, 101, 115, 34, 58, 91, 49, 50, 46, 48, 93, 44, 34, 110, 97, 109, 101, 34, 58, 34, 108, 105, 103, 104, 116, 34, 125, 125] (112) from offset 0 out of 112
            HttpEntityBodyChrc.ReadValue: options=dbus.Dictionary({dbus.String('device'): dbus.ObjectPath('/org/bluez/hci0/dev_60_F8_1D_CD_D3_B7', variant_level=1), dbus.String('offset'): dbus.UInt16(103, variant_level=1)}, signature=dbus.Signature('sv'))
            HttpEntityBodyChrc.ReadValue: [34, 108, 105, 103, 104, 116, 34, 125, 125] (9) from offset 103 out of 112

        """
        log('HttpEntityBodyChrc.ReadValue: options=%s' % options)
        #log("HttpEntityBodyChrc.ReadValue: self.http_entity_body_encoded=%s" % self.http_entity_body_encoded)
        offset = 0
        if options.get(dbus.String('offset')):
          offset = options.get(dbus.String('offset')).real
        offset += self.int_offset
        self.int_offset+= 512
        value = self.http_entity_body_encoded[offset:offset+512]
        log('HttpEntityBodyChrc.ReadValue: %s (%d) from offset %d out of %d' % (value, len(value), offset, len(self.http_entity_body_encoded)))
        self.service.charc_rw_cb(self, 'read', options, value)
        return value



CONTROL_POINT_MAP = {
    1: ("GET",     "http"),
    2: ("HEAD",    "http"),
    3: ("POST",    "http"),
    4: ("PUT",     "http"),
    5: ("DELETE",  "https"),
    6: ("GET",     "https"),
    7: ("HEAD",    "https"),
    8: ("POST",    "https"),
    9: ("PUT",     "https"),
    10: ("DELETE", "https"),
}
CONTROL_POINT_CANCEL_CMD = 11

class HttpControlPointChrc(Characteristic):
    """HTTP Status Code :
        UUID    Property
        2ab9    Write

        See https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_control_point.xml

        Value mapping:

                <Enumeration key="1" value="HTTP GET Request" requires="N/A" description="Initiates an HTTP GET Request." />
                <Enumeration key="2" value="HTTP HEAD Request" requires="N/A" description="Initiates an HTTP HEAD Request." />
                <Enumeration key="3" value="HTTP POST Request" requires="N/A" description="Initiates an HTTP POST Request." />
                <Enumeration key="4" value="HTTP PUT Request" requires="N/A" description="Initiates an HTTP PUT Request." />
                <Enumeration key="5" value="HTTP DELETE Request" requires="N/A" description="Initiates an HTTP DELETE Request." />
                <Enumeration key="6" value="HTTPS GET Request" requires="N/A" description="Initiates an HTTPS GET Reques.t" />
                <Enumeration key="7" value="HTTPS HEAD Request" requires="N/A" description="Initiates an HTTPS HEAD Request." />
                <Enumeration key="8" value="HTTPS POST Request" requires="N/A" description="Initiates an HTTPS POST Request." />
                <Enumeration key="9" value="HTTPS PUT Request" requires="N/A" description="Initiates an HTTPS PUT Request." />
                <Enumeration key="10" value="HTTPS DELETE Request" requires="N/A" description="Initiates an HTTPS DELETE Request." />
                <Enumeration key="11" value="HTTP Request Cancel" requires="N/A" description="Terminates any executing HTTP Request from the HPS Client." />

    1: ("GET",     "http"),
    2: ("HEAD",    "http"),
    3: ("POST",    "http"),
    4: ("PUT",     "http"),
    5: ("DELETE",  "https"),
    6: ("GET",     "https"),

    """

    CHRC_UUID = '00002ab9-0000-1000-8000-00805f9b34fb'
    # methods
    GET     = 1
    HEAD    = 2
    POST    = 3
    PUT     = 4
    DELETE  = 5
    # secure versions of methods
    GETS    = 6
    HEADS   = 7
    POSTS   = 8
    PUTS    = 9
    DELETES = 10
    

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['write'],
                service)
        # Uninitialized. Valid production values are 1 to 11
        self.value = 0

    def WriteValue(self, value, options):
        """When write control point is invoked by the system,

        """
        log('HttpControlPointChrc.WriteValue')

        if len(value) != 1:
            raise InvalidValueLengthException()

        byte = value[0]
        log('HttpControlPointChrc.WriteValue: %s' % repr(byte))

        self.value = int(byte)
        if self.value < 1 or self.value > 11:
            raise FailedException("0x80")
        elif self.value == CONTROL_POINT_CANCEL_CMD:
            # cancel 
            self.service.cancel_request()
        else:
            # notify service write was performed
            log('HttpControlPointChrc: WriteValue: invoking service.charc_rw_cb')
            self.service.charc_rw_cb(self, 'write', options, value)
            #log('HttpControlPointChrc: WriteValue: invoking do_request')
            #self.service.do_request(self._ctrl_point_to_method(self.value))

    def _ctrl_point_to_method(self, value):
        """Convert control point value to corresponding method"""
        return CONTROL_POINT_MAP[self.value][0]


class HttpStatusCodeChrc(Characteristic):
    """HTTP Status Code :           
        2aba    Notify

    see https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.characteristic.http_status_code.xml        


    """
    CHRC_UUID = '00002aba-0000-1000-8000-00805f9b34fb'
    STATUS_BIT_BODY_RECEIVED = 4
    STATUS_BIT_BODY_TRUNCATED = 8

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['notify'],
                service)
        self.notifying = False
        self.http_status_code = 0

    def set_http_status_code(self, value):
        self.http_status_code = value 


    def do_notify(self):
        """Trigger notify (Send http_status_code to dbus)"""
        if self.notifying:
            value = [dbus.Byte(self.http_status_code)]
            log('do_notify: http_status_code: %s (%s)' % (self.http_status_code, repr(value)))
            self.PropertiesChanged(Characteristic.IFACE, { 'Value':  value }, [])

    def StartNotify(self):
        log('StartNotify')
        if self.notifying:
            #log('StartNotify: Already notifying, nothing to do')
            return

        self.notifying = True

    def StopNotify(self):
        if not self.notifying:
            log('StopNotify: Not notifying, nothing to do')
            return
        self.notifying = False


class HttpSecurityChrc(Characteristic):
    """HTTP Status Code :           
        2abb    Read
       Default value: false
    """
    CHRC_UUID = '00002abb-0000-1000-8000-00805f9b34fb'

    def __init__(self, bus, index, service):
        Characteristic.__init__(
                self, bus, index,
                self.CHRC_UUID,
                ['read'],
                service)
        self.set_value(False)

    def set_value(self, value):
        """Can be called from ctor or by client service to change default
        value."""
        self._https_security = value

    def ReadValue(self, options):
        return [dbus.Booean(self._https_security)]

