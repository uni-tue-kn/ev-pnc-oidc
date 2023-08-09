import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BleService {

  constructor() { }

  async connect(name: string): Promise<BluetoothRemoteGATTServer> {
    try {
      // Request connection to the device.
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: name },
        ],
      });

      // Ensure that a device was selected.
      if (!device) {
        throw 'No device selected!';
      }

      // Connect to the device.
      const server = await device.gatt?.connect();

      if (!server) {
        throw 'Failed to connect to device!';
      }

      return server;
    } catch (e) {
      throw 'Failed to connect to device: ' + e;
    }
  }
}
