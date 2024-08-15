import { EventEmitter } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { EMSP_BACKEND_DOMAIN } from './ev.class';
import {
  BODY_CHARACTERISTIC_UUID,
  CONTROL_POINT_CHARACTERISTIC_UUID,
  HEADER_CHARACTERISTIC_UUID,
  HTTP_STATUS_CHARACTERISTIC_UUID,
  URI_CHARACTERISTIC_UUID
} from './http-gatt-uuids';
import { HttpMethods } from './http-methods.type';
import { HttpRawResponse } from './http-raw-response.interface';

export class BluetoothHttpProxyService {
  
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
   * Constructs a new BLE HTTP Proxy Service instance.
   * @param service BLE HTTP Proxy GATT Service.
   */
  constructor(
    public readonly service: BluetoothRemoteGATTService,
  ) { }

  /**
   * Handles changed status characteristics by notifying about changed status.
   */
  private readonly onStatusCharacteristicChanged = async (ev: Event) => {
    // Ensure that received event contains expected value.
    const value = ((ev.target) as BluetoothRemoteGATTCharacteristic | null)?.value;
    if (!value) return;

    // Parse received status code.
    const bytes = [];
    for (let i = 0; i < value.byteLength; i++) {
      bytes.push(value.getUint8(i));
    }
    console.log('received status data', bytes);

    // Notify about changed status code.
    this.statusChanged.emit(bytes[0]);
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
    console.log('Connecting Characteristics ...');
    this.uriCharacteristic = await this.service.getCharacteristic(URI_CHARACTERISTIC_UUID);
    this.controlPointCharacteristic = await this.service.getCharacteristic(CONTROL_POINT_CHARACTERISTIC_UUID);
    this.bodyCharacteristic = await this.service.getCharacteristic(BODY_CHARACTERISTIC_UUID);
    this.headerCharacteristic = await this.service.getCharacteristic(HEADER_CHARACTERISTIC_UUID);
    const statusCharacteristic = await this.service.getCharacteristic(HTTP_STATUS_CHARACTERISTIC_UUID);

    console.log('Characteristics connected!');

    // Wait 5 seconds before continuing...
    await new Promise<void>((resolve, _) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });

    // Start listening to status notifications.
    console.log('Starting notifications of HTTP Status Characteristics ...');
    this.statusCharacteristic = await statusCharacteristic.startNotifications();
    console.log('Start listening to notifications...');
    this.statusCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.onStatusCharacteristicChanged,
      true,
    );
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
  private getMethodCode(protocol: 'http:' | 'https:', method: HttpMethods): number {
    switch (protocol) {
      case 'http:':
        switch (method) {
          case 'GET': return 0x01;
          case 'HEAD': return 0x02;
          case 'POST': return 0x03;
          case 'PUT': return 0x04;
          case 'DELETE': return 0x05;
        }
      case 'https:':
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
  private async sendGet(url: URL, headers: string): Promise<void> {
    // Compute the method code.
    const methodCode = this.getMethodCode(url.protocol as 'http:' | 'https:', 'GET');

    const httpUrl = url.toString().replace('http:', '');
    // Works:
    // const httpHeaders = '12345678901234567890123456789012345678901234567890123456789012345678901234567890';
    // const httpHeaders = '12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
    const httpHeaders = `host: ${EMSP_BACKEND_DOMAIN}`;//\n${headers.replaceAll('\r\n', '|').replaceAll('\n', '|')}`;//\ncontent-length: ${286}`;
    console.log('Sending GET request...');
  
    // Send URL.
    console.log('Sending URL ...', httpUrl);
    await this.uriCharacteristic?.writeValue(this.encoder.encode(httpUrl));
    console.log('Sending Headers ...', httpHeaders);
    await this.headerCharacteristic?.writeValue(this.encoder.encode(httpHeaders));
    console.log('Sending Body ...');
    await this.bodyCharacteristic?.writeValue(this.encoder.encode(''));

    // Write Method Code.
    await this.controlPointCharacteristic?.writeValue(new Uint8Array([methodCode]));
  }

  /**
   * Sends an HTTP POST request to the BLE HTTP Proxy.
   * @param url URL.
   * @param body HTTP POST Body.
   * @param headers HTTP Headers.
   */
  private async sendPost(url: URL, body: string, headers: string): Promise<void> {
    // Compute the method code.
    const methodCode = this.getMethodCode(url.protocol as 'http:' | 'https:', 'POST');

    const httpUrl = url.toString().replace('http:', '');
    const httpHeaders = `host: ${EMSP_BACKEND_DOMAIN}|content-length: ${body.length}|${headers.replaceAll('\r\n', '|').replaceAll('\n', '|')}`;
    console.log('Sending POST request...');

    // Send URL and Body.
    console.log('Sending URL ...', httpUrl);
    await this.uriCharacteristic?.writeValue(this.encoder.encode(httpUrl));
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    console.log('Sending Headers ...', httpHeaders);
    await this.headerCharacteristic?.writeValue(this.encoder.encode(httpHeaders));
    // await new Promise<void>((resolve) => setTimeout(() => resolve(), 100));
    console.log('Sending Body ...', body);
    await this.bodyCharacteristic?.writeValue(this.encoder.encode(body));

    // Write Method Code.
    console.log('Sending POST method code ...', methodCode);
    try {
      await this.controlPointCharacteristic?.writeValue(new Uint8Array([methodCode]));
    } catch (error) {
      if (this.controlPointCharacteristic?.service.device.gatt?.connected !== true) {
        throw error;
      }
    }
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
    const statusCode = await new Promise<number>(async (resolve, reject) => {
      try {
        console.log('Receiving status code...');
        firstValueFrom(this.statusChanged).then((statusCode) => {
          console.log('Status code received', statusCode);
          resolve(statusCode);
        });

        // Send the HTTP GET request.
        console.log('Sending GET request to', url);
        await this.sendGet(url, '');
      } catch (error) {
        reject(error);
      }
    });

    // Read header and body.
    console.log('Receiving header and body ...');
    const responseHeader = await this.readHeader();
    console.log('Header received', responseHeader);
    const responseBody = await this.readBody();
    console.log('Body received', responseBody);

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
   * @param headers HTTP Headers.
   * @returns Raw HTTP response.
   */
  public async post(url: URL, body: string, headers: {[key: string]: string}): Promise<HttpRawResponse> {
    const statusCode = await new Promise<number>(async (resolve, reject) => {
      try {
        console.log('Receiving status code...');
        firstValueFrom(this.statusChanged).then((statusCode) => {
          console.log('Status code received', statusCode);
          resolve(statusCode);
        });

        // Send the HTTP POST request.
        console.log('Sending POST request to', url);
        await this.sendPost(url, body, Object.keys(headers).map((key) => key + ': ' + headers[key]).join('|'));
      } catch (error) {
        reject(error);
      }
    });

    // Read header and body.
    console.log('Receiving header and body ...');
    const responseHeader = await this.readHeader();
    console.log('Header received', responseHeader);
    const responseBody = await this.readBody();
    console.log('Body received', responseBody);

    // Return result.
    return {
      statusCode: statusCode,
      header: responseHeader,
      body: responseBody
    };
  }
}
