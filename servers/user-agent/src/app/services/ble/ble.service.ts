import { Injectable } from '@angular/core';

import { BluetoothHttpProxyService } from '../../types/bluetooth-http-proxy-service';
import { HPS_SERVICE_UUID } from '../../types/http-gatt-uuids';

@Injectable({
  providedIn: 'root',
})
export class BleService {

  /**
   * Connects to a BLE Device.
   * @param name Name of the BLE Device.
   * @param services Supported GATT Service UUIDs.
   * @returns Connected GATT Server.
   */
  async connect(name: string, services?: string[]): Promise<BluetoothRemoteGATTServer> {
    try {
      // Request connection to the device.
      const device = await navigator.bluetooth.requestDevice({
        filters: [{
          name: name,
          services: services,
        }],
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

  /**
   * Creates a new HTTP GATT Service instance an connects to it.
   * @param gatt GATT Server.
   * @returns Connected BLE HTTP GATT Service instance.
   */
  async getHttpService(gatt: BluetoothRemoteGATTServer): Promise<BluetoothHttpProxyService> {
    /// Get the GATT Service.
    const service = await gatt.getPrimaryService(HPS_SERVICE_UUID);

    // Create a new BLE HTTP Proxy Service instance and connect to it.
    const proxyService = new BluetoothHttpProxyService(service);
    await proxyService.connect();

    return proxyService;
  }
}
