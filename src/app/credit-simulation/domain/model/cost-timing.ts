/**
 * When a cost is charged: once, financed into the loan (initial), or every period
 * (periodic — paid even during grace). Mirrors the backend `CostTiming` enum.
 */
export const CostTiming = {
  INITIAL: 'INITIAL',
  PERIODIC: 'PERIODIC',
} as const;

export type CostTiming = (typeof CostTiming)[keyof typeof CostTiming];

/** All cost timings, in display order (for selects). */
export const costTimings: readonly CostTiming[] = [CostTiming.INITIAL, CostTiming.PERIODIC];
