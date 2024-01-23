export interface EMSP {

  /**
   * Unique eMSP ID.
   */
  id: string;

  /**
   * Name of eMSP.
   */
  name: string;

  /**
   * Base URL of Authorization Server.
   */
  base_url: string;

  /**
   * Image URL.
   */
  image?: string;
}
