export class Ev {
  get name(): string {
    return this.gattServer?.device.name ?? 'Unknown EV';
  }

  constructor(
    // TODO: make gattServer a required argument.
    private readonly gattServer?: BluetoothRemoteGATTServer,
  ) {}
}
