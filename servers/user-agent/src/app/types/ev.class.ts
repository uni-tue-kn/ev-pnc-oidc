import { HttpHeaders, HttpResponse } from '@angular/common/http';

import { OAUTH_REDIRECT_URI_PATH } from '../app-routing.module';
import { BluetoothHttpProxyService } from './bluetooth-http-proxy-service';
import { ContractProvisioningRequest } from './contract-provisioning-request.interface';
import { ContractProvisioningResponse } from './contract-provisioning-response.interface';
import { EMSP } from './emsp.interface';
import { IEvAuthorizationDetail } from './ev-authorization-detail.interface';

/**
 * The EMSP Backend Domain.
 */
const EMSP_BACKEND_DOMAIN='ev.localhost';

/**
 * URL used to request available eMSPs.
 */
const EMSP_URL = new URL(`http://${EMSP_BACKEND_DOMAIN}/emsps`);

/**
 * URL used to initialize a Pushed Authorization Request.
 */
const AUTHORIZATION_INITIALIZATION_URL = new URL(`http://${EMSP_BACKEND_DOMAIN}/cpr`);

/**
 * URL used to finish authorization.
 */
const CONFIRMATION_URL = new URL(`http://${EMSP_BACKEND_DOMAIN}/confirm`);

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
   * Requests an array of available eMSPs from the EV.
   * @returns Array of available eMSPs.
   */
  async requestEmsps(): Promise<EMSP[]> {
    // Send GET request.
    const response = await this.get<EMSP[]>(EMSP_URL);

    // Get body and verify its existence.
    const body = response.body;
    if (!body) throw 'No body';

    return body;
  }

  /**
   * Requests the Contract Provisioning from the EV.
   * @param emsp eMSP to request a connection with.
   * @param detail Authorization details.
   * @returns Contract Provisioning Response from EV.
   */
  async requestContractProvisioning(emsp: EMSP, detail: IEvAuthorizationDetail): Promise<ContractProvisioningResponse> {
    try {
      const cpr: ContractProvisioningRequest = {
        emsp_id: emsp.id,
        redirect_uri: `${window.location.origin}/${OAUTH_REDIRECT_URI_PATH}`,
        authorization_detail: detail,
      };
      // Send POST request.
      const response = await this.post<ContractProvisioningResponse>(
        AUTHORIZATION_INITIALIZATION_URL,
        cpr,
      );

      if (response.status !== 201) {
        throw 'Failed';
      }

      // Get body and verify its existence.
      const body = response.body;
      if (!body) throw 'No body';

      return body;
    } catch (e) {
      throw new Error('Contract Provisioning Request failed');
    }
  }

  /**
   * Sends the Authorization Code to the EV and awaits end of authorization process.
   * @param authorizationCode Authorization Code obtained from Authorization Server.
   * @param state State parameter.
   */
  async sendConfirmationRequest(authorizationCode: string, state: string): Promise<void> {
    try {
      const response = await this.post(
        CONFIRMATION_URL, {
        auth_code: authorizationCode,
        state: state,
      });
      if (response.status !== 200) {
        throw 'Failed!';
      }
    } catch (e) {
      throw new Error('Sending Confirmation Request failed');
    }
  }

  /**
   * Disconnects from the EV.
   */
  async disconnect(): Promise<void> {
    await this.httpProxy.disconnect();
    await this.httpProxy.service.device.forget();
  }
}
