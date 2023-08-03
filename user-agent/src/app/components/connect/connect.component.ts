import { Component, OnInit } from '@angular/core';

import { BleService } from '../../services/ble.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {
  constructor(
    private readonly bleService: BleService,
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  private getDeviceName(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        const name = params['name'];
        if (name) {
          resolve(name);
        } else {
          reject('Name not provided!');
        }
      });
    });
  }

  private async connect(): Promise<BluetoothRemoteGATTServer> {
    try {
      // Get the EV name from query parameter.
      const name = await this.getDeviceName();

      // Connect to the EV via BLE.
      const gattServer = await this.bleService.connect(name);

      // Return the connected GATT server of the EV.
      return gattServer;
    } catch (e) {
      throw 'Failed to connect to EV: ' + e;
    }
  }

  public ngOnInit(): void {
    this.connect().then(ev => console.log('connected to ', ev));
  }
}
