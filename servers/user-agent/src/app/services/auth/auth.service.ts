import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DiscoveryDocument } from '../../types/discovery-document.interface';

// /**
//  * Prefix of Key for Authorization Code in Local Storage.
//  */
// const OAUTH_AUTH_CODE_KEY_PREFIX = 'oauth_auth_code_';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  /**
   * Constructs a new Auth Service instance.
   * @param http HTTP Client.
  //  * @param activatedRoute Activated Route.
   */
  constructor(
    private readonly http: HttpClient,
    // private readonly activatedRoute: ActivatedRoute,
  ) { }

  /**
   * Gets the discovery document of an Authorization Server.
   * @param baseUrl Base URL of Authorization Server.
   * @returns Discovery document.
   */
  public async getDiscoveryDocument(baseUrl: string): Promise<DiscoveryDocument> {
    const discoveryUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}.well-known/openid-configuration`;
    return await firstValueFrom(this.http.get<DiscoveryDocument>(discoveryUrl));
  }

  // /**
  //  * Performs a Pushed Authorization Request (PAR) and resolves with the obtained authorization code.
  //  * @param authorizationEndpoint Pushed Authorization Request (PAR) endpoint.
  //  * @param state Authorization Request state id.
  //  * @param requestUri Request URI.
  //  * @param clientId Client ID.
  //  * @param timeout Authorization timeout.
  //  * @returns Authorization Code.
  //  */
  // public async authorize(authorizationEndpoint: string, state: string, requestUri: string, clientId: string, timeout: number = 600000): Promise<string> {
  //   // Build authorization URL.
  //   const authorizationUrl = new URL(authorizationEndpoint);
  //   authorizationUrl.searchParams.append('client_id', clientId);
  //   authorizationUrl.searchParams.append('request_uri', requestUri);

  //   // Generate the key of the local storage variable where the OauthCallbackComponent will write the 
  //   const stateKey = OAUTH_AUTH_CODE_KEY_PREFIX + state;
  //   // Ensure that the state is not yet in use.
  //   if (localStorage.getItem(stateKey) !== null) {
  //     throw new Error('State is already in use!');
  //   }
  //   // Write an empty string to the local storage to reserve the state.
  //   localStorage.setItem(stateKey, '');

  //   try {
  //     // Open authorization URL in new tab and focus this tab.
  //     window.open(authorizationUrl, '_blank')?.focus();

  //     // Await authorization code from new tab returned via local storage.
  //     return await new Promise<string>((resolve, reject) => {
  //       const onStorage = (ev: StorageEvent) => {
  //         // Ensure that event was raised by local storage.
  //         if (ev.storageArea !== window.localStorage) return;
  //         // Ensure that event was raised by state key.
  //         if (ev.key !== stateKey) return;
  //         // Ensure that new value is a valid authorization code.
  //         if (!ev.newValue) return;

  //         // Stop listening to storage storage events and stop timeout.
  //         window.removeEventListener('storage', onStorage);
  //         window.clearTimeout(timeoutId);

  //         // Resolve with authorization code.
  //         resolve(ev.newValue);
  //       };
  //       // Start listening to storage events.
  //       window.addEventListener('storage', onStorage);

  //       // Start a timeout.
  //       const timeoutId = window.setTimeout(() => {
  //         // Stop listening to storage events and clear the timeout.
  //         window.removeEventListener('storage', onStorage);
  //         window.clearTimeout(timeoutId);

  //         // Throw an error.
  //         reject(new Error('Auth Flow timed out!'));
  //       }, timeout);
  //     });
  //   } catch (e) {
  //     // Rethrow the error.
  //     throw e;
  //   } finally {
  //     // Remove the authorization code from local storage.
  //     localStorage.removeItem(stateKey);
  //   }
  // }

  /**
   * Performs a device authorization request.
   * @param verificationUri Verification URI.
   * @param userCode User Code.
   */
  public async authorizeDevice(verificationUri: string, userCode: string): Promise<void> {
    // Build authorization URL.
    const verificationUrl = new URL(verificationUri);
    verificationUrl.searchParams.append('user_code', userCode);

    // Open authorization URL in new tab and focus this tab.
    window.open(verificationUrl, '_blank')?.focus();
  }

  // /**
  //  * Handles URL query parameters of Pushed Authorization Request (PAR) response.
  //  */
  // public async handleParResponse(): Promise<void> {
  //   // Get HTTP Query parameters.
  //   const parameters = await firstValueFrom(this.activatedRoute.queryParams);

  //   // Get the state parameter.
  //   const stateId = parameters['state'];

  //   // Generate the ID of the authorization code key in the local storage.
  //   const stateKey = OAUTH_AUTH_CODE_KEY_PREFIX + stateId;
  //   // Get the stored value for the state.
  //   const stateValue = window.localStorage.getItem(stateKey);

  //   // Verify that the state is active.
  //   if (stateValue === null) return;
  //   // Verify that the state is not yet used.
  //   if (stateValue !== '') return;

  //   // Get the authorization code parameter.
  //   const authCode = parameters['code'];
  //   // Verify that an authorization code was received.
  //   if (!authCode) return;

  //   // Write the state value into the local storage.
  //   window.localStorage.setItem(stateKey, authCode);
  // }
}
