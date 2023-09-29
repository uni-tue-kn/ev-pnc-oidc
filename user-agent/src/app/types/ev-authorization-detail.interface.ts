import { ICurrencyAmount } from './currency_amount.interface';

export interface IEvAuthorizationDetail {
  
  /**
   * Type of the authorization detail.
   */
  type: 'pnc_contract_request';

  /**
   * List of actions that can be performed with the token.
   */
  actions: string[];

  /**
   * List of Resource Server that the Token is valid on.
   */
  locations: string[];

  /**
   * Charging period.
   */
  charging_period: {
    /**
     * Start time as ISO string.
     */
    start: string;

    /**
     * End time as ISO string.
     */
    end: string;
  };

  /**
   * Maximum amount of money to charge with for the entire contract.
   */
  maximum_amount: ICurrencyAmount;

  /**
   * Maximum amount of money to charge with per charging operation.
   */
  maximum_transaction_amount: ICurrencyAmount;
}
