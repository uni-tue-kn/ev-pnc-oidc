#!/usr/bin/env python3
"""Example gatt server for heart_rate, battery and other services as defined in hrservice.py

"""
import dbus
import dbus.exceptions
import dbus.mainloop.glib
import dbus.service

import array
import sys

#from yaglib import Application, GattManager
from yaglib import AdvertisementManager, Advertisement

class HpAdvertisement(Advertisement):

    def __init__(self, ctx, index):
        Advertisement.__init__(self, ctx, index, 'peripheral')

        # heart rate
        #self.add_service_uuid('180D')
        # Battery Service
        #self.add_service_uuid('180F')

        # heart rate
        self.add_service_uuid('1823')
        # some manufacturer data
        self.add_manufacturer_data(0xffff, [0x00, 0x01, 0x02, 0x03, 0x04])
        # some service data
        self.add_service_data('9999', [0x00, 0x01, 0x02, 0x03, 0x04])
        self.include_tx_power = True


def main():
    adman = AdvertisementManager()
    adman.add_advertisement(HpAdvertisement(adman, 0))
    adman.run()

if __name__ == '__main__':
    main()
