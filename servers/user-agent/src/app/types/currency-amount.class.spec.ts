import { CurrencyAmount } from './currency-amount.class';

describe('CurrencyAmount', () => {
  it('should create an instance', () => {
    expect(new CurrencyAmount(123.45, 'EUR')).toBeTruthy();
  });
});
