import { EventEmitter } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BODY_CHARACTERISTIC_UUID, CONTROL_POINT_CHARACTERISTIC_UUID, HEADER_CHARACTERISTIC_UUID, HTTP_STATUS_CHARACTERISTIC_UUID, URI_CHARACTERISTIC_UUID } from './http-gatt-uuids';
import { HttpMethods } from './http-methods.type';
import { HttpRawResponse } from './http-raw-response.interface';

export class BluetoothHttpProxyService {

  /**
   * Constructs a new BLE HTTP Proxy Service instance.
   * @param service BLE HTTP Proxy GATT Service.
   */
  constructor(
    public readonly service: BluetoothRemoteGATTService,
  ) { }

  /**
   * Text Encoder.
   */
  private readonly encoder = new TextEncoder();
  /**
   * Text Decoder.
   */
  private readonly decoder = new TextDecoder();

  /**
   * BLE GATT Characteristic for HTTP Body.
   */
  private bodyCharacteristic?: BluetoothRemoteGATTCharacteristic;
  /**
   * BLE GATT Characteristic for HTTP Control Point.
   */
  private controlPointCharacteristic?: BluetoothRemoteGATTCharacteristic;
  /**
   * BLE GATT Characteristic for HTTP Headers.
   */
  private headerCharacteristic?: BluetoothRemoteGATTCharacteristic;
  /**
   * BLE GATT Characteristic for HTTP Status Codes.
   */
  private statusCharacteristic?: BluetoothRemoteGATTCharacteristic;
  /**
   * BLE GATT Characteristic for HTTP URLs.
   */
  private uriCharacteristic?: BluetoothRemoteGATTCharacteristic;

  /**
   * Handles changed status characteristics by notifying about changed status.
   */
  private readonly onStatusCharacteristicChanged = async () => {
    // Read new status code.
    const data = await this.statusCharacteristic?.readValue();
    // Parse status code.
    const statusCode = data?.getUint16(0);
    // Notify about changed status code.
    this.statusChanged.emit(statusCode);
  }

  /**
   * Notifies about changed status.
   */
  private statusChanged = new EventEmitter<number>();

  /**
   * Connects to the HTTP GATT Proxy.
   */
  public async connect(): Promise<void> {
    // Get all relevant GATT characteristics.
    [
      this.uriCharacteristic,
      this.statusCharacteristic,
      this.controlPointCharacteristic,
      this.bodyCharacteristic,
      this.headerCharacteristic,
    ] = await Promise.all([
      this.service.getCharacteristic(URI_CHARACTERISTIC_UUID),
      this.service.getCharacteristic(HTTP_STATUS_CHARACTERISTIC_UUID),
      this.service.getCharacteristic(CONTROL_POINT_CHARACTERISTIC_UUID),
      this.service.getCharacteristic(BODY_CHARACTERISTIC_UUID),
      this.service.getCharacteristic(HEADER_CHARACTERISTIC_UUID),
    ]);

    // Start listening to status notifications.
    this.statusCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.onStatusCharacteristicChanged,
    );
    await this.statusCharacteristic.startNotifications();
  }

  /**
   * Disconnects from the HTTP GATT Proxy.
   */
  public async disconnect(): Promise<void> {
    // Stop listening to status notifications.
    await this.statusCharacteristic?.stopNotifications();
    this.statusCharacteristic?.removeEventListener(
      'characteristicvaluechanged',
      this.onStatusCharacteristicChanged,
    );
  }

  /**
   * Gets the BLE HTTP Proxy Method Code.
   * @param protocol Protocol.
   * @param method HTTP Method.
   * @returns Method Number.
   */
  private getMethodCode(protocol: 'http' | 'https', method: HttpMethods): number {
    switch (protocol) {
      case 'http':
        switch (method) {
          case 'GET': return 0x01;
          case 'HEAD': return 0x02;
          case 'POST': return 0x03;
          case 'PUT': return 0x04;
          case 'DELETE': return 0x05;
        }
      case 'https':
        switch (method) {
          case 'GET': return 0x06;
          case 'HEAD': return 0x07;
          case 'POST': return 0x08;
          case 'PUT': return 0x09;
          case 'DELETE': return 0x0a;
        }
    }
  }

  /**
   * Sends an HTTP GET request to the BLE HTTP Proxy.
   * @param url URL.
   */
  private async sendGet(url: URL): Promise<void> {
    // Compute the method code.
    const methodCode = this.getMethodCode(url.protocol as 'http' | 'https', 'POST');

    // Send URL.
    await this.uriCharacteristic?.writeValue(this.encoder.encode(url.toString()));

    // Write Method Code.
    await this.controlPointCharacteristic?.writeValue(new Uint8Array([methodCode]));
  }

  /**
   * Sends an HTTP POST request to the BLE HTTP Proxy.
   * @param url URL.
   * @param body HTTP POST Body.
   */
  private async sendPost(url: URL, body: string): Promise<void> {
    // Compute the method code.
    const methodCode = this.getMethodCode(url.protocol as 'http' | 'https', 'POST');

    // Send URL and Body.
    await Promise.all([
      this.uriCharacteristic?.writeValue(this.encoder.encode(url.toString())),
      this.bodyCharacteristic?.writeValue(this.encoder.encode(body)),
    ]);

    // Write Method Code.
    await this.controlPointCharacteristic?.writeValue(new Uint8Array([methodCode]));
  }

  /**
   * Reads the HTTP Body.
   * @returns Body as string.
   */
  private async readBody(): Promise<string> {
    // Read value from body characteristic.
    const data = await this.bodyCharacteristic?.readValue();
    // Decode body and resolve it.
    return this.decoder.decode(data);
  }

  /**
   * Reads the HTTP Headers.
   * @returns Headers as string.
   */
  private async readHeader(): Promise<string> {
    // Read header from header characteristic.
    const data = await this.headerCharacteristic?.readValue();
    // Decode header and resolve it.
    return this.decoder.decode(data);
  }

  /**
   * Sends an HTTP GET request to the BLE HTTP Proxy and resolves response.
   * @param url URL.
   * @returns Raw HTTP response.
   */
  public async get(url: URL): Promise<HttpRawResponse> {
    // Send the HTTP GET request.
    await this.sendGet(url);

    // Await status code.
    const statusCode = await firstValueFrom(this.statusChanged);

    // Read header and body.
    const [
      responseHeader,
      responseBody,
    ] = await Promise.all([
      this.readHeader(),
      this.readBody(),
    ]);

    // Return result.
    return {
      statusCode: statusCode,
      header: responseHeader,
      body: responseBody
    };
  }

  /**
   * Sends an HTTP POST request to the BLE HTTP Proxy and resolves response.
   * @param url URL.
   * @param body HTTP Body.
   * @returns Raw HTTP response.
   */
  public async post(url: URL, body: string): Promise<HttpRawResponse> {
    // Send the HTTP POST request.
    await this.sendPost(url, body);

    // Await status code.
    const statusCode = await firstValueFrom(this.statusChanged);

    // Read header and body.
    const [
      responseHeader,
      responseBody,
    ] = await Promise.all([
      this.readHeader(),
      this.readBody(),
    ]);

    // Return result.
    return {
      statusCode: statusCode,
      header: responseHeader,
      body: responseBody
    };
  }
}
