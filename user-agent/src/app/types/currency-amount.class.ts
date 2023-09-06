import { Currencies } from './currencies.enum';
import { ICurrencyAmount } from './currency_amount.interface';

export class CurrencyAmount {
  /**
   * Constructs a new Currency Amount.
   * @param amount Amount of money.
   * @param currency Currency.
   */
  constructor(
    public readonly amount: number,
    public readonly currency: Currencies,
  ) { }

  /**
   * Serializes the currency amount.
   */
  toJson(): ICurrencyAmount {
    return {
      currency: this.currency,
      amount: this.amount.toFixed(2),
    };
  }
}
