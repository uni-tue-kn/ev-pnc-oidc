import { Currencies } from './currencies.enum';

export interface ICurrencyAmount {

  /**
   * Amount of money.
   */
  amount: string;

  /**
   * Currency.
   */
  currency: Currencies;
}
