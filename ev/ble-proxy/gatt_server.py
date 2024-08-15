import os
import sys
import logging
import asyncio
import threading
import requests
import struct
from typing import Any, Union
from bless import (
    BlessServer,
    BlessGATTCharacteristic,
    GATTCharacteristicProperties,
    GATTAttributePermissions,
)

# Service UUIDs:
HPS_SERVICE_UUID = '00001823-0000-1000-8000-00805f9b34fb'

# Characteristic UUIDs:
URI_CHARACTERISTIC_UUID = '00002ab6-0000-1000-8000-00805f9b34fb'
HTTP_CONTROL_POINT_CHARACTERISTIC_UUID = '00002aba-0000-1000-8000-00805f9b34fb'
HTTP_ENTITY_BODY_CHARACTERISTIC_UUID = '00002ab9-0000-1000-8000-00805f9b34fb'
HTTP_HEADERS_CHARACTERISTIC_UUID = '00002ab7-0000-1000-8000-00805f9b34fb'
HTTP_STATUS_CODE_CHARACTERISTIC_UUID = '00002ab8-0000-1000-8000-00805f9b34fb'

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(name=__name__)

# NOTE: Some systems require different synchronization methods.
trigger: Union[asyncio.Event, threading.Event]
if sys.platform in ["darwin", "win32"]:
    trigger = threading.Event()
else:
    trigger = asyncio.Event()

server: BlessServer | None = None
uri: str | None = None
headers: str | None = None
body: str | None = None

controlNumbers = {
    0x01: {
        'protocol': 'http:',
        'method': 'GET',
    },
    0x02: {
        'protocol': 'http:',
        'method': 'HEAD',
    },
    0x03: {
        'protocol': 'http:',
        'method': 'POST',
    },
    0x04: {
        'protocol': 'http:',
        'method': 'PUT',
    },
    0x05: {
        'protocol': 'http:',
        'method': 'DELETE',
    },
    0x06: {
        'protocol': 'https:',
        'method': 'GET',
    },
    0x07: {
        'protocol': 'https:',
        'method': 'HEAD',
    },
    0x08: {
        'protocol': 'https:',
        'method': 'POST',
    },
    0x09: {
        'protocol': 'https:',
        'method': 'PUT',
    },
    0x0a: {
        'protocol': 'https:',
        'method': 'DELETE',
    },
}

def read_request(characteristic: BlessGATTCharacteristic, **kwargs) -> bytearray:
    if characteristic.uuid == HTTP_HEADERS_CHARACTERISTIC_UUID:
        logger.debug(f"Reading headers with value '{headers}'...")
        if headers == None:
            return ''.encode("utf-8")
        else:
            return headers.encode("utf-8")
    elif characteristic.uuid == HTTP_ENTITY_BODY_CHARACTERISTIC_UUID:
        logger.debug(f"Reading body with value '{body}'")
        if body == None:
            return ''.encode("utf-8")
        else:
            return body.encode("utf-8")
    else:
        logger.debug(f"Reading value of unknown characteristic '{characteristic.uuid}'")
        return ''.encode("utf-8")

def write_request(characteristic: BlessGATTCharacteristic, value: Any, **kwargs):
    logger.debug(f"Received write command from characteristic {characteristic.uuid}")
    global uri
    global headers
    global body
    if characteristic.uuid == URI_CHARACTERISTIC_UUID:
        # URI Characteristic:
        uri = value.decode("utf-8")
        logger.debug(f"URI set to '{uri}'")
    elif characteristic.uuid == HTTP_HEADERS_CHARACTERISTIC_UUID:
        # Headers Characteristic:
        headers = value.decode("utf-8")
        logger.debug(f"Headers set to:\n'''\n{headers}\n'''")
    elif characteristic.uuid == HTTP_ENTITY_BODY_CHARACTERISTIC_UUID:
        # Body Characteristic:
        body = value.decode("utf-8")
        logger.debug(f"Body set to:\n'''\n{body}\n'''")
    elif characteristic.uuid == HTTP_CONTROL_POINT_CHARACTERISTIC_UUID:
        # Control Point Characteristic:
        logger.debug(f"Received value '{''.join(format(x, '02x') for x in value)}'")
        if characteristic.value == b"\x0b":
            # TODO: cancel request
            logger.debug(f"Received cancellation request")
        else:
            code = controlNumbers[value[0]]
            if code != None:
                logger.debug(f"Sending {code['method']} request via {code['protocol']}...")
                req_headers = None
                if headers != None:
                    header_rows = headers.split('|')
                    req_headers = {}
                    for row in header_rows:
                        header_pair = row.split(': ')
                        req_headers[header_pair[0]] = header_pair[1]
                proxy(uri=uri, protocol=code['protocol'], method=code['method'], req_headers=req_headers, req_body=body)
            else:
                logger.debug(f"Received unknown control value '{value}'")
    else:
        logger.debug(f"Unknown characteristic {characteristic.uuid} tried to write value {value}")
    logger.debug(f"uri: {uri} | headers: {headers} | body: {body}")

def proxy(uri: str, protocol: str, method: str, req_headers: dict | None, req_body = str | None):
    # Generate URL
    url = f"{protocol}{uri}"
    logger.debug(f"Sending {method} request to '{url}' with headers '{req_headers}' and body '{req_body}'...")

    # Send request
    if method == "GET":
        r = requests.get(url, headers=req_headers)
    elif method == "POST":
        r = requests.post(url, req_body, headers=req_headers)
    elif method == "HEAD":
        r = requests.post(url, headers=req_headers)
    elif method == "PUT":
        r = requests.post(url, req_body, headers=req_headers)
    elif method == "DELETE":
        r = requests.post(url, headers=req_headers)
    else:
        logger.debug(f"Unknown method {method}!")
        return

    # Convert status code to uint16
    status_code = struct.pack('H', r.status_code & 0xffff)
    logger.debug(f"Received status code {r.status_code} ({status_code})")

    # Process headers
    rcv_headers = []
    for header in r.headers:
        rcv_headers.append(f"{header}: {r.headers[header]}")
    global headers
    headers = '|'.join(rcv_headers)

    # Get the status code characteristic
    char = server.get_characteristic(HTTP_STATUS_CODE_CHARACTERISTIC_UUID)

    # # Notify changed body
    # char.value = b"\x01"
    # server.update_value(
    #     HPS_SERVICE_UUID,
    #     HTTP_STATUS_CODE_CHARACTERISTIC_UUID,
    # )

    # Process body
    global body
    body = r.text

    # Notify changed body
    response_code = [status_code[0], status_code[1], 0x04]
    char.value = response_code
    logger.debug(f"Notifying about response code {response_code}")
    server.update_value(
        HPS_SERVICE_UUID,
        HTTP_STATUS_CODE_CHARACTERISTIC_UUID,
    )

async def run(loop):
    trigger.clear()

    # Instantiate the server
    device_name = os.getenv("DEVICE_NAME")
    if device_name == None:
        device_name = "HTTP Proxy Service"
    logger.debug(f"Device name is {device_name}")
    global server
    server = BlessServer(
        name=device_name,
        loop=loop,
    )
    server.read_request_func = read_request
    server.write_request_func = write_request

    # Add HTTP Proxy Service
    await server.add_new_service(HPS_SERVICE_UUID)

    # Add URI characteristic:
    uri_char_flags = (
        GATTCharacteristicProperties.write
    )
    uri_char_permissions = GATTAttributePermissions.writeable
    await server.add_new_characteristic(
        HPS_SERVICE_UUID,
        URI_CHARACTERISTIC_UUID,
        uri_char_flags,
        None,
        uri_char_permissions,
    )

    # Add HTTP Headers characteristic:
    http_headers_char_flags = (
        GATTCharacteristicProperties.read |
        GATTCharacteristicProperties.write
    )
    http_headers_char_permissions = (
        GATTAttributePermissions.readable |
        GATTAttributePermissions.writeable
    )
    await server.add_new_characteristic(
        HPS_SERVICE_UUID,
        HTTP_HEADERS_CHARACTERISTIC_UUID,
        http_headers_char_flags,
        None,
        http_headers_char_permissions,
    )

    # Add HTTP Entity Body characteristic:
    http_entity_body_char_flags = (
        GATTCharacteristicProperties.read |
        GATTCharacteristicProperties.write
    )
    http_entity_body_char_permissions = (
        GATTAttributePermissions.readable |
        GATTAttributePermissions.writeable
    )
    await server.add_new_characteristic(
        HPS_SERVICE_UUID,
        HTTP_ENTITY_BODY_CHARACTERISTIC_UUID,
        http_entity_body_char_flags,
        None,
        http_entity_body_char_permissions,
    )

    # Add HTTP Control Point characteristic:
    http_control_point_char_flags = (
        GATTCharacteristicProperties.write
    )
    http_control_point_char_permissions = (
        GATTAttributePermissions.writeable
    )
    await server.add_new_characteristic(
        HPS_SERVICE_UUID,
        HTTP_CONTROL_POINT_CHARACTERISTIC_UUID,
        http_control_point_char_flags,
        None,
        http_control_point_char_permissions,
    )

    # Add HTTP Status Code characteristic:
    http_status_code_char_flags = (
        GATTCharacteristicProperties.notify
    )
    http_status_code_char_permissions = (
        GATTAttributePermissions.readable
    )
    await server.add_new_characteristic(
        HPS_SERVICE_UUID,
        HTTP_STATUS_CODE_CHARACTERISTIC_UUID,
        http_status_code_char_flags,
        None,
        http_status_code_char_permissions,
    )

    await server.start()
    logger.debug(f"BLE HTTP Proxy started with name '{device_name}'")
    if trigger.__module__ == "threading":
        trigger.wait()
    else:
        await trigger.wait()

    await asyncio.sleep(5)#3600000)

    logger.debug("Stopping server...")
    await server.stop()

if __name__ == '__main__':
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(run(loop=loop))
    except KeyboardInterrupt:
        pass
