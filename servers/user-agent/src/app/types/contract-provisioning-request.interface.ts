import { IEvAuthorizationDetail } from './ev-authorization-detail.interface';

export interface ContractProvisioningRequest {

  /**
   * ID of eMSP.
   */
  emsp_id: string;

  /**
   * Redirect URI for OAuth flow.
   */
  redirect_uri: string;

  /**
   * EV Authorization Detail.
   */
  authorization_detail: IEvAuthorizationDetail;
}
