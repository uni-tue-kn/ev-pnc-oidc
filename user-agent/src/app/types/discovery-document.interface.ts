export interface DiscoveryDocument {
  /**
   * Issuer URI.
   */
  issuer: string;

  /**
   * Authorization Endpoint.
   */
  authorization_endpoint: string;

  /**
   * Token Endpoint.
   */
  token_endpoint: string;

  /**
   * JWKS URI.
   */
  jwks_uri: string;

  /**
   * Pushed Authorization Request Endpoint.
   */
  pushed_authorization_request_endpoint?: string;
}
