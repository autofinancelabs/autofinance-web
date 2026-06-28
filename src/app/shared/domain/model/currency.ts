/**
 * The currencies an operation can be denominated in. The system is mono-currency
 * per operation (no FX): a value is entirely in PEN or USD.
 */
export const Currency = {
  PEN: 'PEN',
  USD: 'USD',
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];
