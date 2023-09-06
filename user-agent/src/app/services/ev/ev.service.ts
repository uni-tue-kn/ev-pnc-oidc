import { Injectable } from '@angular/core';

import { Ev } from '../../types/ev.class';
import { HPS_SERVICE_UUID } from '../../types/http-gatt-uuids';
import { BleService } from '../ble/ble.service';

@Injectable({
  providedIn: 'root',
})
export class EvService {

  /**
   * Constructs a new EV Service instance.
   * @param bleService Bluetooth LE Service.
   */
  constructor(
    private readonly bleService: BleService,
  ) { }

  /**
   * Connects to an EV.
   * @param name Name of EV to connect to.
   * @returns 
   */
  async connect(name: string): Promise<Ev> {
    try {
      // Connect to the EV via BLE.
      const gattServer = await this.bleService.connect(name, [HPS_SERVICE_UUID]);

      // Connect to BLE HTTP Proxy Service.
      const proxyService = await this.bleService.getHttpService(gattServer);

      // Return the connected EV instance.
      return new Ev(proxyService);
    } catch (e) {
      throw 'Failed to connect to EV: ' + e;
    }
  }
}
