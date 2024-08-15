import { IEvAuthorizationDetail } from './ev-authorization-detail.interface';

export interface ContractProvisioningRequest {

  /**
   * ID of eMSP.
   */
  emsp_id: string;

  /**
   * EV Authorization Detail.
   */
  authorization_detail: IEvAuthorizationDetail;
}
