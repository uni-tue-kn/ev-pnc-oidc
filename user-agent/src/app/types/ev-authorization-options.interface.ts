import { ICurrencyAmount } from './currency_amount.interface';

export interface IEvAuthorizationOptions {
  /**
   * Charging period.
   */
  chargingPeriod: {
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
  maximumAmount: ICurrencyAmount;

  /**
   * Maximum amount of money to charge with per charging operation.
   */
  maximumTransactionAmount: ICurrencyAmount;
}
