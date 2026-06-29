import {AmountPipe} from './amount.pipe';

describe('AmountPipe', () => {
  const pipe = new AmountPipe();

  it('formats a number with two decimals and a thousands separator', () => {
    expect(pipe.transform(9015.99)).toBe('9,015.99');
  });

  it('pads to two decimals', () => {
    expect(pipe.transform(20)).toBe('20.00');
  });

  it('returns empty for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
