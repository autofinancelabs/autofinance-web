import {RatePipe} from './rate.pipe';

describe('RatePipe', () => {
  const pipe = new RatePipe();

  it('formats a fraction as a percentage', () => {
    const result = pipe.transform(0.207856);
    expect(result).toContain('20.7856');
    expect(result).toContain('%');
  });

  it('caps the decimals via maxDigits', () => {
    expect(pipe.transform(0.2078561, 4)).toContain('20.7856');
  });

  it('returns empty for null/undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
