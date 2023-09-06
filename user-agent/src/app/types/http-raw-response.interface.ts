export interface HttpRawResponse {

  /**
   * HTTP Status Code.
   */
  statusCode: number;

  /**
   * HTTP Headers.
   */
  header: string;

  /**
   * HTTP Body.
   */
  body: string;
}
