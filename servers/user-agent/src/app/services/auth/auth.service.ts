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
}
