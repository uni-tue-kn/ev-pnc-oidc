import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss'],
})
export class OauthCallbackComponent implements OnInit {

  /**
   * OAuth Authorization Callback Page.
   * @param authService Authorization Service.
   */
  constructor(
    private readonly authService: AuthService,
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
    // // Handle PAR response.
    // await this.authService.handleDeviceAuthorizationResponse();

    // Update UI.
    this.processed = true;

    // Close this window now.
    window.close();
  }
}
