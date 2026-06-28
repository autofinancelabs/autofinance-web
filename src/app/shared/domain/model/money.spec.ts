import {Currency} from './currency';
import {Money} from './money';

describe('Money', () => {
  it('exposes amount and currency', () => {
    const money = new Money({amount: 100.5, currency: Currency.PEN});
    expect(money.amount).toBe(100.5);
    expect(money.currency).toBe('PEN');
  });

  it('equals compares amount and currency', () => {
    const base = new Money({amount: 100, currency: Currency.USD});
    expect(base.equals(new Money({amount: 100, currency: Currency.USD}))).toBe(true);
    expect(base.equals(new Money({amount: 100, currency: Currency.PEN}))).toBe(false);
    expect(base.equals(new Money({amount: 101, currency: Currency.USD}))).toBe(false);
  });
});
