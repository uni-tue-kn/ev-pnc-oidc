import { CurrencyAmount } from './currency-amount.class';
import { IEvAuthorizationDetail } from './ev-authorization-detail.interface';

export class EvAuthorizationDetail {
  /**
   * Constructs new EV Authorization Options.
   * @param actions Actions that can be performed with the Token.
   * @param locations URLs of Resource Servers that the Token can be used at.
   * @param chargingPeriod Charging period.
   * @param maximumAmount Maximum amount of money to charge with for the entire contract.
   * @param maximumTransactionAmount Maximum amount of money to charge with per charging operation.
   */
  constructor(
    public readonly actions: string[],
    public readonly locations: string[],
    public readonly chargingPeriod: { start: Date, end: Date },
    public readonly maximumAmount: CurrencyAmount,
    public readonly maximumTransactionAmount: CurrencyAmount,
  ) { }

  /**
   * Serializes the EV Authorization Options.
   */
  toJson(): IEvAuthorizationDetail {
    return {
      type: 'pnc_contract_request',
      actions: this.actions,
      locations: this.locations,
      charging_period: {
        start: this.chargingPeriod.start.toISOString(),
        end: this.chargingPeriod.end.toISOString(),
      },
      maximum_amount: this.maximumAmount.toJson(),
      maximum_transaction_amount: this.maximumTransactionAmount.toJson(),
    };
  }
}
