import { Injectable } from '@angular/core';
import { BleService } from '../ble/ble.service';
import { Ev } from 'src/app/types/ev.class';

@Injectable({
  providedIn: 'root'
})
export class EvService {

  constructor(
    private readonly bleService: BleService,
  ) { }

  async connect(name: string): Promise<Ev> {
    try {
      // TODO: Remove this line.
      return new Ev();
      // Connect to the EV via BLE.
      const gattServer = await this.bleService.connect(name);

      // Return the connected EV instance.
      return new Ev(gattServer);
    } catch (e) {
      throw 'Failed to connect to EV: ' + e;
    }
  }

}
