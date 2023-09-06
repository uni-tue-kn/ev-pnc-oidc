export interface EMSP {
  /**
   * Base URL of Authorization Server.
   */
  base_url: string;

  /**
   * Image URL.
   */
  image?: string;

  /**
   * Name of eMSP.
   */
  name: string;

  /**
   * OAuth Client ID.
   */
  client_id: string;

  /**
   * Unique eMSP ID.
   */
  id: string;
}
