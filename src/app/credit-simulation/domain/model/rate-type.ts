/**
 * Nature of the interest rate the advisor enters: nominal (needs a capitalization
 * to become effective) or effective. Mirrors the backend `RateType` enum; travels
 * as a string on the wire. Const object + union to match the codebase's style.
 */
export const RateType = {
  NOMINAL: 'NOMINAL',
  EFFECTIVE: 'EFFECTIVE',
} as const;

export type RateType = (typeof RateType)[keyof typeof RateType];

/** All rate types, in display order (for selects). */
export const rateTypes: readonly RateType[] = [RateType.NOMINAL, RateType.EFFECTIVE];
