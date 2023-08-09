import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { encodeBase64url } from '@jonasprimbs/byte-array-converter';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
  ) { }

  private generateRandomString(length: number, characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    const charLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charLength));
    }
    return result;
  }

  private generatePkceVerifier(): string {
    const arrayBuffer = new Uint8Array(32);
    const randomBytes = crypto.getRandomValues(arrayBuffer);
    return encodeBase64url(randomBytes);
  }
  private async computePkceCodeChallenge(verifier: string): Promise<string> {
    const verifierLength = verifier.length;
    const charCodes = [];
    for (let i = 0; i < verifierLength; i++) {
      charCodes.push(verifier.charCodeAt(i));
    }
    const ascii = Uint8Array.from(charCodes);
    const hash = await crypto.subtle.digest('SHA-256', ascii);
    return encodeBase64url(new Uint8Array(hash));
  }

  public async getDiscoveryDocument(baseUrl: string): Promise<DiscoveryDocument> {
    const discoveryUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}.well-known/openid-configuration`;
    return await firstValueFrom(this.http.get<DiscoveryDocument>(discoveryUrl));
  }

  public async sendPar<T extends AuthorizationRequestParameter>(parEndpoint: string, options: T): Promise<ParResponseBody> {
    try {
      // Generate x-www-form-urlencoded body from PAR options.
      const body = new URLSearchParams();
      const obj: { [id: string]: any } = {...options};
      for (const key in options) {
        const value = obj[key];
        switch (typeof value) {
          case 'string':
            body.append(key, value);
            break;
          case 'number':
            body.append(key, value.toString());
            break;
          case 'boolean':
            body.append(key, value ? '1' : '0');
            break;
          default:
            body.append(key, JSON.stringify(value));
            break;
        }
      }

      // Send PAR and return response.
      return await firstValueFrom(this.http.post<ParResponseBody>(parEndpoint, body));
    } catch (e) {
      throw new Error('Failed to send Pushed Authorization Request: ' + e);
    }
  }

  /**
   * Starts a pushed authorization request to get an authorization code.
   * @param authorizationEndpoint Authorization Endpoint of the Authorization Server.
   * @param options PAR initialization options.
   * @returns Obtained authorization code.
   */
  public async requestPushedAuthorizationCode(authorizationEndpoint: string, options: ParInitializationOptions): Promise<string> {
    // Generate HTTP query parameters from options.
    const parameters = new HttpParams()
    parameters.append('client_id', options.parOptions.client_id);
    parameters.append('request_uri', options.parOptions.request_uri);

    // Generate the key of the local storage variable where the OauthCallbackComponent will write the 
    const stateKey = OAUTH_AUTH_CODE_KEY_BASE + options.state;
    // Ensure that the state is not yet in use.
    if (localStorage.getItem(stateKey) !== null) throw new Error('State is already in use!');
    // Write an empty string to the local storage to reserve the state.
    localStorage.setItem(stateKey, '');

    try {
      // Open authorization code flow in a new tab.
      window.open(authorizationEndpoint + '?' + parameters.toString(), '_blank')?.focus();

      return await Promise.race([
        // Timeout promise.
        new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Auth Flow timed out!'));
          }, options.timeout ?? 600000);
        }),
        // Promise which regularly checks for the authorization code in the local storage.
        new Promise<string>((resolve, reject) => {
          const interval = setInterval(() => {
            // Request the authorization code from the local storage.
            const authCode = localStorage.getItem(stateKey);

            if (authCode === null) {
              // No entry found -> Authorization code was already processed.
              clearInterval(interval);
              reject(new Error('Auth Flow expired!'));
            } else if (authCode !== '') {
              // Authorization code received -> resolve it.
              clearInterval(interval);
              resolve(authCode);
            } else {
              // Nothing to do here -> continue.
            }
          }, options.refreshInterval ?? 1000);
        }),
      ]);
    } catch (e) {
      throw new Error('Failed to obtain Authorization Code: ' + e);
    } finally {
      // Unregister from local storage.
      localStorage.removeItem(stateKey);
    }
  }

  /**
   * Performs a pushed authorization request (PAR) to obtain an authorization code.
   * @param baseUrl Base URL of the OpenID Provider (= issuer).
   * @param options PAR options.
   * @returns Obtained authorization code.
   */
  public async authorize(baseUrl: string, options: ParOptions): Promise<string> {
    try {
      // Get discovery document.
      const discoveryDocument = await this.getDiscoveryDocument(baseUrl);

      // Get Pushed Authorization Request (PAR) and ensure that it is supported.
      const parEndpoint = discoveryDocument.pushed_authorization_request_endpoint;
      if (!parEndpoint) {
        throw new Error(`RFC 9126 (OAuth 2.0 Pushed Authorization Requests) is not supported by the Authorization Server with Base URL "${baseUrl}"!`);
      }

      // Generate a random state to identify this authorization request.
      const state = this.generateRandomString(20);

      // Generate PKCE parameters.
      const pkceVerifier = this.generatePkceVerifier();
      const pkceCodeChallenge = await this.computePkceCodeChallenge(pkceVerifier);

      // Register Pushed Authorization Request.
      const response = await this.sendPar<ParRequestBodyWithPkce>(parEndpoint, {
        response_type: 'code',
        state: state,
        client_id: options.clientOptions.client_id,
        code_challenge: pkceCodeChallenge,
        code_challenge_method: 'S256',
        scope: options.scopes?.join(' '),
      });

      // Use Request URI from PAR response to initialize the authorization code flow in a new tab.
      return await this.requestPushedAuthorizationCode(discoveryDocument.authorization_endpoint, {
        state: state,
        parOptions: {
          client_id: options.clientOptions.client_id,
          request_uri: response.request_uri,
        },
      });
    } catch (e) {
      throw e;
    }
  }
}

export interface ParInitializationOptions {
  state: string;
  parOptions: PushedAuthorizationRequestParameter;
  refreshInterval?: number;
  timeout?: number;
}

export interface DiscoveryDocument {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  jwks_uri: string;
  pushed_authorization_request_endpoint?: string;
}

export interface PkceAuthorizationRequestParameterExtension {
  code_challenge: string;
  code_challenge_method: 'plain' | 'S256';
}

export interface AuthorizationRequestParameter {
  response_type: 'code' | 'token';
  client_id: string;
  redirect_uri?: string;
  scope?: string;
  state: string;
}

export interface PushedAuthorizationRequestParameter {
  client_id: string;
  request_uri: string;
}

export interface RarAuthorizationDetail {
  type: string;
  locations?: string[];
  actions?: string[];
  datatypes?: string[];
  identifier?: string;
  privileges: string[];
  [key: string]: any;
}

export interface RarAuthorizationRequestParameterExtension<T extends RarAuthorizationDetail> {
  authorization_details: T[];
}

export interface ParRequestBodyBase extends AuthorizationRequestParameter {
  [key: string]: any;
}

export interface ParRequestBody extends ParRequestBodyBase, Partial<PkceAuthorizationRequestParameterExtension> { }

export interface ParRequestBodyWithPkce extends ParRequestBodyBase, PkceAuthorizationRequestParameterExtension { }

export interface RarRequestBodyBase<T extends RarAuthorizationDetail> extends AuthorizationRequestParameter, RarAuthorizationRequestParameterExtension<T> { }

export interface RarRequestBody<T extends RarAuthorizationDetail> extends RarRequestBodyBase<T>, Partial<PkceAuthorizationRequestParameterExtension> { }

export interface RarRequestBodyWithPkce<T extends RarAuthorizationDetail> extends RarRequestBodyBase<T>, PkceAuthorizationRequestParameterExtension { }

export interface ParResponseBody {
  request_uri: string;
  expires_in: number;
}

export interface ParOptions {
  scopes?: string[];
  authorizationDetails?: RarAuthorizationDetail[];
  clientOptions: AuthClientOption;
}

export interface AuthClientOption {
  client_id: string;
  client_secret?: string;
  redirect_uri: string;
}

export const URL_UNRESERVED_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

export const OAUTH_REDIRECT_URI_PATH = 'authorization_callback';

export const OAUTH_AUTH_CODE_KEY_BASE = 'oauth_auth_code_'