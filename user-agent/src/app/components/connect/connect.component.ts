import { Component, OnInit } from '@angular/core';

import { BleService } from '../../services/ble.service';
import { ActivatedRoute } from '@angular/router';
import { EMSP } from 'src/app/emsp';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {
  name?: string;
  device?: BluetoothRemoteGATTServer;
  emsps: EMSP[] = [];
  emsp?: EMSP;

  constructor(
    private readonly bleService: BleService,
    private readonly activatedRoute: ActivatedRoute,
  ) { }

  private getDeviceName(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        const name = params['name'];
        this.name = name;
        if (name) {
          resolve(name);
        } else {
          reject('Name not provided!');
        }
      });
    });
  }

  private async findName(): Promise<void> {
    try {
      // Get the EV name from query parameter.
      this.name = await this.getDeviceName();
    } catch (e) {
      throw 'Failed to get name: ' + e;
    }
  }

  async connect(name: string): Promise<BluetoothRemoteGATTServer> {
    try {
      // Connect to the EV via BLE.
      const gattServer = await this.bleService.connect(name);

      // Return the connected GATT server of the EV.
      return gattServer;
    } catch (e) {
      throw 'Failed to connect to EV: ' + e;
    }
  }

  async selectEmsp(emsp: EMSP) {
    this.emsp = emsp;
  }

  async getEMSPs(): Promise<EMSP[]> {//device: BluetoothRemoteGATTServer): Promise<EMSP[]> {
    return [
      {
        base_url: 'http://localhost:8080',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Ionity_logo_cmyk.svg',
        name: 'Ionity',
        client_id: 'ionity_ev',
      }
    ];
  }

  async initializeConnection(name: string): Promise<void> {
    // Connect to device:
    // const device = await this.connect(name);

    // Request eligible eMSPs:
    this.emsps = await this.getEMSPs();//device);



  }

  public ngOnInit(): void {
    this.findName();
  }
}
