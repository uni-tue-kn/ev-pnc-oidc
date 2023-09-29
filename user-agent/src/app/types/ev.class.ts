import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { EMSP } from './emsp.interface';
import { IEvAuthorizationDetail } from './ev-authorization-detail.interface';
import { EvAuthorizationResponse } from './ev-authorization-response.interface';
import { BluetoothHttpProxyService } from './bluetooth-http-proxy-service';

/**
 * URL used to initialize a Pushed Authorization Request.
 */
const AUTHORIZATION_INITIALIZATION_URL = new URL('https://localhost:4443/initialize');

/**
 * URL used to finish authorization.
 */
const AUTHORIZATION_URL = new URL('https://localhost:4443/authorize');

/**
 * URL used to request available eMSPs.
 */
const EMSP_URL = new URL('https://localhost:4443/emsps');

export class Ev {

  /**
   * Gets the name of the EV.
   */
  get name(): string {
    return this.httpProxy.service.device.name ?? 'Unknown EV';
  }

  /**
   * Constructs a new Electric Vehicle instance.
   * @param httpProxy BLE HTTP Proxy Service.
   */
  constructor(
    private readonly httpProxy: BluetoothHttpProxyService,
  ) { }

  /**
   * Sends an HTTP GET request via BLE to the EV.
   * @param url URL.
   * @returns Parsed response.
   */
  private async get<R>(url: URL): Promise<HttpResponse<R>> {
    // Send HTTP POST request and await response.
    const response = await this.httpProxy.get(url);

    // Parse HTTP response.
    return new HttpResponse<R>({
      status: response.statusCode,
      headers: new HttpHeaders(response.header),
      body: JSON.parse(response.body),
    });
  }

  /**
   * Sends an HTTP POST request via BLE to the EV.
   * @param url URL.
   * @param body POST Body.
   * @returns Parsed response.
   */
  private async post<R>(url: URL, body: object): Promise<HttpResponse<R>> {
    // Parse HTTP request body.
    const bodyString = JSON.stringify(body);

    // Send HTTP POST request and await response.
    const response = await this.httpProxy.post(url, bodyString);

    // Parse HTTP response.
    return new HttpResponse<R>({
      status: response.statusCode,
      headers: new HttpHeaders(response.header),
      body: JSON.parse(response.body),
    });
  }

  /**
   * Requests the Authorization URI for the Pushed Authorization Request from the EV.
   * @param emsp eMSP to request a connection with.
   * @param details Authorization details.
   * @returns Authorization Initialization Response from EV.
   */
  async requestAuthorizationUri(emsp: EMSP, details: IEvAuthorizationDetail[]): Promise<EvAuthorizationResponse> {
    try {
      // Send POST request.
      const response = await this.post<EvAuthorizationResponse>(
        AUTHORIZATION_INITIALIZATION_URL, {
        emsp_id: emsp.id,
        details: details,
      });

      // Get body and verify its existance.
      const body = response.body;
      if (!body) throw 'No body';

      return body;
    } catch (e) {
      throw new Error('Requesting Authorization URI failed');
    }
  }

  /**
   * Sends the Authorization Code to the EV and awaits end of authorization process.
   * @param authorizationCode Authorization Code obtained from Authorization Server.
   * @param state State parameter.
   */
  async sendAuthorizationCode(authorizationCode: string, state: string): Promise<void> {
    try {
      await this.post(
        AUTHORIZATION_URL, {
        auth_code: authorizationCode,
        state: state,
      });
    } catch (e) {
      throw new Error('Sending Authorization Code failed');
    }
  }

  /**
   * Requests an array of available eMSPs from the EV.
   * @returns Array of available eMSPs.
   */
  async requestEmsps(): Promise<EMSP[]> {
    // Send GET request.
    const response = await this.get<EMSP[]>(EMSP_URL);

    // Get body and verify its existance.
    const body = response.body;
    if (!body) throw 'No body';

    return body;
  }
}
