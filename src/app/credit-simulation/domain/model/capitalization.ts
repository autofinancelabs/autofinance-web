/**
 * Capitalization frequency for a nominal rate (required only when the rate is
 * NOMINAL). Mirrors the backend `Capitalization` enum; travels as a string on the
 * wire (the day mapping 1/30/90/180/360 is applied server-side).
 */
export const Capitalization = {
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMIANNUAL: 'SEMIANNUAL',
  ANNUAL: 'ANNUAL',
} as const;

export type Capitalization = (typeof Capitalization)[keyof typeof Capitalization];

/** All capitalizations, in ascending-period order (for selects). */
export const capitalizations: readonly Capitalization[] = [
  Capitalization.DAILY,
  Capitalization.MONTHLY,
  Capitalization.QUARTERLY,
  Capitalization.SEMIANNUAL,
  Capitalization.ANNUAL,
];
