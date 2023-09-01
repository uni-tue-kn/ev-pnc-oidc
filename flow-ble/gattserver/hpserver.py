#!/usr/bin/env python3
"""Example gatt server for heart_rate, battery and other services as defined in hrservice.py

"""
import sys
import datetime
import time
import logging
import json
import zlib
#import threading, thread
import threading
#import gobject, gtk
# python3
import _thread as thread
import requests



# this works in both Python 3.4.2 and 3.5.2
__version__ = "0.1.01"




from gi.repository import GObject as gobject

# this doesn't work on 3.4.2 (raspian) and there is 
#  no easy replacement. Therefore 
#  Gdk.threads_init()
#  won't be invoked on raspian
#from gi.repository import Gdk

#try:
#  # Python 3.5.2 (Ubuntu 16.04)
#  from gi.repository import GObject as gobject
#  print('hpserver: Python 3.5.2?')
#except ImportError:
#  print('hpserver: Python 3.4.2?')
#  # Python 3.4.2 (RasPI)
#  #import gobject
#  #gtk.gdk.threads_init()


"""
# disable Gdk.threads_init() for now since it doesn't work on raspi
#  and threads work without it
try:
  # Python 3.5.2 (Ubuntu 16.04)
  import gi
  # ./hpserver.py:37: PyGIWarning: Gdk was imported without specifying a version first. Use gi.require_version('Gdk', '3.0') before import to ensure that the right version gets loaded.
  gi.require_version('Gdk', '3.0')
  from gi.repository import Gdk
  Gdk.threads_init()
  print('hpserver: Python 3.5+')
except ImportError:
  print('hpserver: Python 3.4.x?')
  # Python 3.4.2 (RasPI)
  #import gobject
  #gtk.gdk.threads_init()
  pass
"""

from yaglib import Application, GattManager
from hpservice import HttpProxyService, HttpStatusCodeChrc, HttpControlPointChrc, HttpEntityBodyChrc
from mqttclient import MqttSubscriber
import dbus


# set simulator this to True to not use mqtt, but to use simulated constant JSON 
#  packets instead
simulator = True
# set to False to eliminate DEBUG level log.
verbose = True

# value between 0.5 and 1. works
read_done_timeout = 1.0
#delay_before_read = 1.0
delay_before_read = 0.1

GEN_SLEEP = 2

# set flush for trace output to daemon.log
#import functools
#print = functools.partial(print, flush=True)

def init_logging():
    formatter = logging.Formatter('%(asctime)s: %(levelname)s: %(message)s')
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if verbose else logging.INFO)
    console_handler.setFormatter(formatter)
    root = logging.getLogger()
    root.addHandler(console_handler)
    root.setLevel(logging.DEBUG)

init_logging()

def needsCompression(body):
    """Determins if compression is needed.
    """
    return len(body) > 100
    #return len(body) > 512

def compress(body):
    """Performs compression of payload.
    """
    orig_len = len(body)
    body = zlib.compress(body)
    logging.debug("compressed from %d to %d bytes" % (orig_len, len(body)))
    return body

def on_message(client, userdata, msg):
    """Mqtt receiver function, forwards packets of JSON payload received to BLE 'websocket'.

    Uses two queues to keep messages that may arrive faster/in bursts than they can be pushed to client.
    We'll be using queues like this:
     * low piority queue for update_diagram type of JSON messages
     * high piority queue for other  types of JSON messages

    update_diagram message type can be discarded if it hasn't been sent out 
    before the next message of the same time has arrived.

    Sample payloads received:
      {"type": "update_diagram", "parameters": {"values": {"1": "197.0", "2": "25.22", "3": "222.22"}}}
      {"type": "diagram_list", "parameters": {"diagrams": ...

    Args:
     client: paho mqtt client
     userdata: holds service instance
     msg: MQTTMessage class, which has members topic, payload, qos, retain and mid.
    """
    #global lastBody
    service = userdata
    try:
        # TODO: if body longer than 512, zlib.compress
        body = bytearray(msg.payload).decode(encoding='UTF-8')
        jsonobj = json.loads(body)
        mtype = jsonobj.get("type")
        if mtype == "update_diagram":
            if service.last_update_message == body:
                logging.debug("repeat update message: skipping: %s" % body)
                return
            if service.last_large_body_ts + datetime.timedelta(seconds=1) > datetime.datetime.now():
                logging.debug("update message while receiving sending large payloads: skipping: %s" % body)
                # but update last body to induce post-diagram list update
                service.last_update_message = body
                return
                
            service.last_update_message = body
            service.last_update_ts = datetime.datetime.now()
        logging.debug("%s: %s" % (datetime.datetime.isoformat(datetime.datetime.now()), body))
        # check if compressed
        if needsCompression(body):
            body = compress(msg.payload)
            #logging.debug("compressed body start %s" % body[:5])
            logging.debug("compressed payload %d -> %d" % (len(msg.payload), len(body)))
        # compressed body start b'x\x9c\xed\x97M'
        #if body[:2] == b'x\x9c': 
        #    logging.debug("body is compressed") 
        #else:
        #    logging.debug("body is not compressed")
        #print(msg.topic+" "+str(msg.qos)+" "+str(msg.payload) + "; userdata=%s" % userdata) 

        # before signaling new payload, wait for previous read op to complete
        #  or timeout after 0.5s or so
        rc = service.read_event.wait(timeout=read_done_timeout)
        if not rc:
            logging.debug("read_event timeout")
        else:
            logging.debug("no read_event timeout")
        extra_delay = delay_before_read
        if len(service.http_entity_body_chrc.get_http_entity_body()) > 100:
            extra_delay =+ 1.0
        time.sleep(extra_delay)
        service.read_event.clear()
        service.http_entity_body_chrc.set_http_entity_body(body)
        service.http_status_code_chrc.do_notify() 

    except UnicodeDecodeError:
        logging.error("on_message: Can't decode utf-8")
        return
    except Exception as err:
        logging.error("on_message: Error occured: %s" % err)
        return



#service = None

class GeneratorTask(object):
   """Allows to invoke code to execute repeatedely from a thread."""

   def __init__(self, generator, loop_callback, complete_callback=None):
       self.generator = generator
       self.loop_callback = loop_callback
       self.complete_callback = complete_callback

   def _start(self, *args, **kwargs):
       self._stopped = False
       for ret in self.generator(*args, **kwargs):
           if self._stopped:
               thread.exit()
           gobject.idle_add(self._loop, ret)
       if self.complete_callback is not None:
           gobject.idle_add(self.complete_callback)

   def _loop(self, ret):
       if ret is None:
           ret = ()
       if not isinstance(ret, tuple):
           ret = (ret,)
       self.loop_callback(*ret)

   def start(self, *args, **kwargs):
       th = threading.Thread(target=self._start, args=args, kwargs=kwargs)
       # make program exit when main thread exits
       th.daemon = True
       th.start()

   def stop(self):
       self._stopped = True





def get_next_payload(service=None):
    """Retrieves next payload to be sent via websocket."""
    body = '{"timestamp":"2017-05-04T01:38:00.336090Z","type":"sensor_update","parameters":{"values":[12.0],"name":"light"}}'
    if service:
        response = requests.get(service.http_uri_chrc.uri)
        body = response.content
    return body

def charc_rw_cb(charc, read_or_write, options, value):
    """Control point read/write callback.
    Called before Read or Write completes and returns from
    Characteristics processing.
    Args: 
    	charc: Characteristic instance calling back.
    	read_or_write: 'read' or 'write'
    	options: options in ReadValue or WriteValue invocation
    	value: write or read value

    """
    #global service
    logging.debug("charc_rw_cb: read_or_write=%s, options=%s" % (read_or_write, options))

    if charc.CHRC_UUID == HttpControlPointChrc.CHRC_UUID:
        """
     * the service calls server implementation via the custom callback
     * the server implementation provides the data, it could be any data retrieval:
       in classical "proxy" sense it can perform an HTTP request to get the data,
       or it can retrieve data from a queue that is serviing the URI specified via
       uri characteristic
     * the server places the acquired data into http_entity_body characteristic
       for later retrieval by the client
     * now that data is ready, a notification is triggered on http_status_code characteristic

        """
        logging.debug("charc_rw_cb: HttpControlPointChrc")
        if read_or_write == 'write':
            # TODO: implement cancel
            # CONTROL_POINT_CANCEL_CMD
            #if value == HttpControlPointChrc.CANCEL_CMD:
            #elif value == HttpControlPointChrc.GET_CMD or HttpControlPointChrc.GETS_CMD:
            #else ...

            # set body received for subsequent notifications to work properly in websocket mode.
#            charc.service.http_status_code_chrc.set_http_status_code(HttpStatusCodeChrc.STATUS_BIT_BODY_RECEIVED)
            charc.service.http_status_code_chrc.set_http_status_code(HttpStatusCodeChrc.STATUS_BIT_BODY_TRUNCATED)

    elif charc.CHRC_UUID == HttpEntityBodyChrc.CHRC_UUID:
        logging.debug("charc_rw_cb: HttpEntityBodyChrc CHRC_UUID=%s" % charc.CHRC_UUID)
        if read_or_write == 'read':
            offset = options.get(dbus.String('offset')).real if options.get(dbus.String('offset')) else 0
            if offset > 0:
                charc.service.last_large_body_ts = datetime.datetime.now()
            # mark read done
            charc.service.read_event.set()
    else:
        logging.debug("charc_rw_cb: Unknown: CHRC_UUID=%s" % charc.CHRC_UUID)

def send_next_payload(service):
    #if not service:
    #    return
    if service.http_control_point_chrc.value not in [HttpControlPointChrc.GET, HttpControlPointChrc.GETS]:
        logging.debug("send_next_payload skipped since service.http_control_point_chrc.value is %d" \
          % service.http_control_point_chrc.value)
        return
    else:
        logging.debug("send_next_payload - sending")
        global GEN_SLEEP
        GEN_SLEEP = 0.4
        if service.http_entity_body_chrc.int_offset > len(service.http_entity_body_chrc.http_entity_body_encoded):
                body = get_next_payload(service)
                service.http_entity_body_chrc.int_offset = 0
                service.http_entity_body_chrc.set_http_entity_body(body)
                GEN_SLEEP = 2
#        service.http_status_code_chrc.set_http_status_code(8)
#        service.last_large_body_ts = datetime.datetime.now()
        logging.debug("URI: %s" % service.http_uri_chrc.uri)
#        service.http_entity_body_chrc.set_http_entity_body(body)
#        service.status = HttpProxyService.CHRC_READ_PENDING
        service.http_status_code_chrc.do_notify() 

def send_next_payload_generator_thread(service):
    count = 0
    while True:
        count += 1
        time.sleep(GEN_SLEEP)
        logging.debug("count: %d" % count)
        yield service

def main():
    man = GattManager()
    service = HttpProxyService(man, 0, charc_rw_cb)
    man.add_service(service)
    
    # start send next payload thread
    if simulator:
        GeneratorTask(send_next_payload_generator_thread, send_next_payload).start(service)
    else:
        # TODO: load mqTopic from config
        mqTopic = "flow/ble"
        s = MqttSubscriber(mqTopic)
        s.user_data_set(service)
        s.start(on_message)


    man.run()

if __name__ == '__main__':
    main()
