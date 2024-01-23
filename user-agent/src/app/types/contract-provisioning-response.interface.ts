export interface ContractProvisioningResponse {

  /**
   * The URI of the Pushed Authorization Request.
   */
  request_uri: string;

  /**
   * The Client ID to use for the authorization request.
   */
  client_id: string;

  /**
   * The EV state.
   */
  state: string;
}
