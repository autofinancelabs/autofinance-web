import {Currency} from '../domain/model/currency';
import {Money} from '../domain/model/money';
import {MoneyPipe} from './money.pipe';

describe('MoneyPipe', () => {
  const pipe = new MoneyPipe();

  it('formats a PEN amount', () => {
    const result = pipe.transform(new Money({amount: 30000, currency: Currency.PEN}));
    expect(result).toContain('30');
    expect(result).toMatch(/S\/|PEN/);
  });

  it('formats a USD amount', () => {
    const result = pipe.transform(new Money({amount: 30000, currency: Currency.USD}));
    expect(result).toContain('30');
    expect(result).toMatch(/\$|USD/);
  });

  it('returns empty string for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
