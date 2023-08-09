import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService, OAUTH_REDIRECT_URI_PATH } from '../../services/auth/auth.service';
import { EmspService } from '../../services/emsp/emsp.service';
import { EvService } from '../../services/ev/ev.service';
import { EMSP } from '../../types/emsp.interface';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent implements OnInit {

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly emspService: EmspService,
    private readonly evService: EvService,
    private readonly formBuilder: FormBuilder,
  ) { }

  // Component lifecycle:

  /**
   * Initializes the component.
   */
  public ngOnInit(): void {
    // Apply the EV name from the URL query parameter.
    this.applyEvNameFromRoute();
  }

  // Connect step:

  /**
   * The form group for the EV connection step.
   */
  connectEvFormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    connected: [false, Validators.requiredTrue],
  });

  /**
   * Whether the app is connecting to the EV.
   */
  isConnectingToEv: boolean = false;

  /**
   * The error message thrown when connecting to EV.
   */
  connectEvError?: string;

  /**
   * Sets the EV's name from URL query parameter to the input field, if provided.
   */
  private async applyEvNameFromRoute(): Promise<void> {
    // Get the EV name from URL query parameter.
    const name = await this.getEvNameFromRoute();

    // Apply name if found.
    if (name) {
      this.connectEvFormGroup.controls.name.setValue(name);
    }
  }

  /**
   * Gets the name of the EV from current route's URL query parameter.
   * @returns Name of the EV or undefined if not found.
   */
  private getEvNameFromRoute(): Promise<string | undefined> {
    return new Promise<string>((resolve) => {
      this.activatedRoute.queryParams.subscribe((params) => {
        resolve(params['name'] ?? undefined);
      });
    });
  }

  /**
   * Connects to an EV.
   * @param name Name of EV.
   */
  async connectEv(name: string): Promise<void> {
    // Clear error.
    this.connectEvError = undefined;

    // Indicate that the app is trying to connect to the EV.
    this.isConnectingToEv = true;

    // Reset connected value.
    this.connectEvFormGroup.controls.connected.setValue(false);

    try {
      // Connect to EV.
      const ev = await this.evService.connect(name);

      // Request available eMSPs from EV.
      await this.emspService.updateEmsps(ev);
      // List available eMSPs.
      this.availableEmsps = [...this.emspService.getEmsps()];

      // Update connected value.
      this.connectEvFormGroup.controls.connected.setValue(true);
    } catch (e) {
      // Log error.
      console.error('Failed to connect to EV!', e);

      // Display error.
      if (e instanceof Error) {
        this.connectEvError = e.message;
      } else {
        this.connectEvError = 'Unknown connect error occurred: ' + e;
      }
    } finally {
      // Indicate that the app is no more trying to connect to the EV.
      this.isConnectingToEv = false;
    }
  }

  // Authorize eMSP step:

  /**
   * Array of avaialable eMSPs.
   */
  availableEmsps?: EMSP[];

  /**
   * The form group for the eMSP authorization step.
   */
  authorizeEmspFormGroup = this.formBuilder.group({
    emspId: ['', Validators.required],
    authorized: [false, Validators.requiredTrue],
  });

  /**
   * Whether the app is authorizing to eMSP.
   */
  isAuthorizingEmsp: boolean = false;

  /**
   * The error message thrown when authorizing to eMSP.
   */
  authorizeEmspError?: string;

  /**
   * Requests authorization to an eMSP.
   * @param emspId The ID of the eMSP to authorize to.
   */
  async authorizeEmsp(emspId: string): Promise<void> {
    // Clear error.
    this.authorizeEmspError = undefined;

    // Indicate that app is trying to authorize to eMSP.
    this.isAuthorizingEmsp = true;

    // Reset authorized value.
    this.authorizeEmspFormGroup.controls.authorized.setValue(false);

    try {
      // Get the eMSP by ID or throw exception.
      const emsp = this.emspService.getEmspById(emspId);
      if (!emsp) throw new Error(`EMSP with ID "${emspId}" not found!`);

      // Initialize eMSP authorization.
      await this.authService.authorize(emsp.base_url, {
        authorizationDetails: [
          // TODO: add rich authorization details here.
        ],
        scopes: [
          // TODO: add scopes here.
        ],
        clientOptions: {
          client_id: emsp.client_id,
          redirect_uri: window.location.origin + '/' + OAUTH_REDIRECT_URI_PATH,
        }
      });

      // Update authorized value.
      this.authorizeEmspFormGroup.controls.authorized.setValue(true);
    } catch (e) {
      // Log error.
      console.error('Failed to obtain authorization from eMSP!', e);

      // Display error.
      if (e instanceof Error) {
        this.authorizeEmspError = e.message;
      } else {
        this.authorizeEmspError = 'Unknown authorization error occurred: ' + e;
      }
    } finally {
      this.isAuthorizingEmsp = false;
    }
  }
}
