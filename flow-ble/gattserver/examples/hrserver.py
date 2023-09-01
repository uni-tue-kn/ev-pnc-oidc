#!/usr/bin/env python3
"""Example gatt server for heart_rate, battery and other services as defined in hrservice.py

"""
import dbus
import dbus.exceptions
import dbus.mainloop.glib
import dbus.service

import array
import sys

from yaglib import Application, GattManager
from hrservice import HeartRateService, BatteryService

def main():
    man = GattManager()
    man.add_service(HeartRateService(man, 0))
    man.add_service(BatteryService(man, 1))
    #man.add_service(TestService(man, 2))
    man.run()

if __name__ == '__main__':
    main()

def main2():
    man = GattManager()
    service = HttpProxyService(man, 0, charc_rw_cb)
    man.add_service(service)
    # start send next payload thread
    GeneratorTask(send_next_payload_generator_thread, send_next_payload).start(service)
    man.run()
