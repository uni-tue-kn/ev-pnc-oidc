import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { OAUTH_AUTH_CODE_KEY_BASE } from '../../services/auth/auth.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss'],
})
export class OauthCallbackComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  /**
   * Whether the authorization code was already processed.
   */
  processed: boolean = false;

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.handleQueryParameters();
  }

  /**
   * Extracts the received authorization code from HTTP query parameter and stores it to the local storage.
   */
  private async handleQueryParameters(): Promise<void> {
    // Get HTTP Query parameters.
    const parameters = await firstValueFrom(this.activatedRoute.queryParams);

    // Get the state parameter.
    const stateId = parameters['state'];

    // Generate the ID of the authorization code key in the local storage.
    const stateKey = OAUTH_AUTH_CODE_KEY_BASE + stateId;
    // Get the stored value for the state.
    const stateValue = localStorage.getItem(stateKey);

    // Verify that the state is active.
    if (stateValue === null) return;
    // Verify that the state is not yet used.
    if (stateValue !== '') return;

    // Get the authorization code parameter.
    const authCode = parameters['code'];
    // Verify that an authorization code was received.
    if (!authCode) return;

    // Write the state value into the local storage.
    localStorage.setItem(stateKey, authCode);

    // Update UI.
    this.processed = true;

    // Close this window now.
    window.close();
  }
}
