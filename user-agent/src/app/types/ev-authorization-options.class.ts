import { CurrencyAmount } from './currency-amount.class';
import { IEvAuthorizationOptions } from './ev-authorization-options.interface';

export class EvAuthorizationOptions {
  /**
   * Constructs new EV Authorization Options.
   * @param chargingPeriod Charging period.
   * @param maximumAmount Maximum amount of money to charge with for the entire contract.
   * @param maximumTransactionAmount Maximum amount of money to charge with per charging operation.
   */
  constructor(
    public readonly chargingPeriod: { start: Date, end: Date },
    public readonly maximumAmount: CurrencyAmount,
    public readonly maximumTransactionAmount: CurrencyAmount,
  ) { }

  /**
   * Serializes the EV Authorization Options.
   */
  toJson(): IEvAuthorizationOptions {
    return {
      chargingPeriod: {
        start: this.chargingPeriod.start.toISOString(),
        end: this.chargingPeriod.end.toISOString(),
      },
      maximumAmount: this.maximumAmount.toJson(),
      maximumTransactionAmount: this.maximumTransactionAmount.toJson(),
    };
  }
}
