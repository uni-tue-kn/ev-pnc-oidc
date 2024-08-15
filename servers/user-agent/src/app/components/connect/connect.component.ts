import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { EmspService } from '../../services/emsp/emsp.service';
import { EvService } from '../../services/ev/ev.service';
import { CurrencyAmount } from '../../types/currency-amount.class';
import { EMSP } from '../../types/emsp.interface';
import { Ev } from '../../types/ev.class';
import { EvAuthorizationDetail } from '../../types/ev-authorization-detail.class';
import { IEvAuthorizationDetail } from '../../types/ev-authorization-detail.interface';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss'],
})
export class ConnectComponent implements OnInit {

  /**
   * Constructs a new Connect Component.
   * @param activatedRoute Activated Route.
   * @param authService Authorization Service.
   * @param emspService eMSP Service.
   * @param evService EV Service.
   * @param formBuilder Form Builder.
   */
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
  public connectEvFormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    connected: [false, Validators.requiredTrue],
  });

  /**
   * Whether the app is connecting to the EV.
   */
  public isConnectingToEv: boolean = false;

  /**
   * The error message thrown when connecting to EV.
   */
  public connectEvError?: string;

  /**
   * Connected Electric Vehicle instance.
   */
  public connectedEv?: Ev;

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
        resolve(params['device_name'] ?? undefined);
      });
    });
  }

  /**
   * Connects to an EV.
   * @param name Name of EV.
   */
  public async connectEv(name: string): Promise<void> {
    // Clear error.
    this.connectEvError = undefined;

    // Indicate that the app is trying to connect to the EV.
    this.isConnectingToEv = true;

    // Reset connected value.
    this.connectEvFormGroup.controls.connected.setValue(false);

    try {
      // Connect to EV.
      console.log(`Connecting to ev "${name}"...`);
      const ev = await this.evService.connect(name);
      console.log('Connected to ev', ev);
      // Mark EV as connected.
      this.connectedEv = ev;
      // Update connected value.
      this.connectEvFormGroup.controls.connected.setValue(true);

      await new Promise<void>((resolve, _) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      console.log('Updating eMSPs...');
      // Request available eMSPs from EV.
      await this.emspService.updateEmsps(ev);
      // List available eMSPs.
      this.availableEmsps = [...this.emspService.getEmsps()];
      console.log('Available eMSPs found', this.availableEmsps);
    } catch (e) {
      // Log error.
      console.error('Failed to connect to EV!', e);

      // Cleanup.
      if (this.connectedEv !== undefined) {
        // Disconnect if connected.
        this.connectedEv.disconnect();
      }
      this.connectedEv = undefined;
      this.connectEvFormGroup.controls.connected.setValue(false);
      this.emspService.clearEmsps();
      this.availableEmsps = undefined;

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

  // Select eMSP step:

  /**
   * Array of available eMSPs.
   */
  public availableEmsps?: EMSP[];

  /**
   * The form group for the eMSP authorization step.
   */
  public selectEmspFormGroup = this.formBuilder.group({
    emspId: ['', Validators.required],
  });

  /**
   * The currently selected eMSP.
   */
  public selectedEmsp?: EMSP;

  /**
   * The error message thrown when selecting an eMSP.
   */
  public selectEmspError?: string;

  /**
   * Requests authorization to an eMSP.
   * @param emspId The ID of the eMSP to authorize to.
   */
  public async selectEmsp(emspId: string): Promise<void> {
    // Clear error.
    this.selectEmspError = undefined;

    // Reset selected eMSP.
    this.selectedEmsp = undefined;

    try {
      // Get the eMSP by ID or throw exception.
      const emsp = this.emspService.getEmspById(emspId);
      if (!emsp) throw new Error(`EMSP with ID "${emspId}" not found!`);

      // Select the eMSP.
      this.selectedEmsp = emsp;
    } catch (e) {
      // Log error.
      console.error('Failed to select eMSP!', e);

      // Cleanup.
      this.selectedEmsp = undefined;

      // Display error.
      if (e instanceof Error) {
        this.selectEmspError = e.message;
      } else {
        this.selectEmspError = 'Unknown eMSP selection error occurred: ' + e;
      }
    }
  }

  // Contract Provisioning step:

  /**
   * Whether the app is authorizing to eMSP.
   */
  public isAuthorizingEmsp: boolean = false;

  /**
   * Whether the app is waiting for a contract provisioning response.
   */
  public waitForContractProvisioningResponse: boolean = false;

  /**
   * Whether the app is waiting for user authorization.
   */
  public waitForUserAuthorization: boolean = false;

  /**
   * Whether the app is waiting for an authorization response from the EV.
   */
  public waitForEvAuthorizationResponse: boolean = false;

  /**
   * The error message thrown when authorization fails.
   */
  public authorizationError?: string;

  /**
   * The form group of the authorization step.
   */
  public authorizationOptionsFormGroup = this.formBuilder.group({
    chargingPeriodStart: [new Date(), Validators.required],
    chargingPeriodEnd: [new Date(Date.now() + 2592000000), Validators.required],
    maximumAmount: [200.0, Validators.required],
    maximumTransactionAmount: [100.0, Validators.required],
  });

  /**
   * Parses the authorization options from the form.
   * @returns Parsed authorization options.
   */
  private getAuthorizationDetail(): IEvAuthorizationDetail {
    return new EvAuthorizationDetail(
      {
        start: this.authorizationOptionsFormGroup.controls.chargingPeriodStart.value!,
        end: this.authorizationOptionsFormGroup.controls.chargingPeriodEnd.value!,
      },
      new CurrencyAmount(this.authorizationOptionsFormGroup.controls.maximumAmount.value!, 'USD'),
      new CurrencyAmount(this.authorizationOptionsFormGroup.controls.maximumTransactionAmount.value!, 'USD'),
    ).toJson();
  }

  /**
   * Performs authorization.
   */
  public async authorize(): Promise<void> {
    // Clear error.
    this.authorizationError = undefined;

    // Indicate that app is trying to authorize to eMSP.
    this.isAuthorizingEmsp = true;

    // Clear other state notifications.
    this.waitForContractProvisioningResponse = false;
    this.waitForUserAuthorization = false;
    this.waitForEvAuthorizationResponse = false;

    try {
      // Ensure that eMSP is selected.
      if (!this.selectedEmsp) {
        throw new Error('No eMSP selected!');
      }
      // Ensure that the EV is connected.
      if (!this.connectedEv) {
        throw new Error('No EV connected!');
      }

      // Send Contract Provisioning Request and wait for response.
      this.waitForContractProvisioningResponse = true;
      const contractProvisioningResponse = await this.connectedEv.requestContractProvisioning(
        this.selectedEmsp,
        this.getAuthorizationDetail(),
      );
      this.waitForContractProvisioningResponse = false;

      // Redirect user to Authorization Endpoint in a new tab and wait for authorization.
      await this.authService.authorizeDevice(
        contractProvisioningResponse.verification_uri,
        contractProvisioningResponse.user_code,
      );
    } catch (e) {
      // Log error.
      console.error('Failed to obtain authorization from eMSP!', e);

      // Display error.
      if (e instanceof Error) {
        this.authorizationError = e.message;
      } else {
        this.authorizationError = 'Unknown authorization error occurred: ' + e;
      }
    } finally {
      this.isAuthorizingEmsp = false;
      this.waitForContractProvisioningResponse = false;
      this.waitForUserAuthorization = false;
      this.waitForEvAuthorizationResponse = false;
    }
  }
}
