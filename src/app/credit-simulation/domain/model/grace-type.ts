/**
 * Grace applied to a period: none (S, ordinary), total (T, no payment — interest
 * capitalizes) or partial (P, interest only). Mirrors the backend `GraceType`
 * enum; travels as a string on the wire, one entry per installment.
 */
export const GraceType = {
  NONE: 'NONE',
  TOTAL: 'TOTAL',
  PARTIAL: 'PARTIAL',
} as const;

export type GraceType = (typeof GraceType)[keyof typeof GraceType];

/** All grace types, in display order (for selects). */
export const graceTypes: readonly GraceType[] = [
  GraceType.NONE,
  GraceType.TOTAL,
  GraceType.PARTIAL,
];
