/**
 * Lifecycle state of a credit simulation: DRAFT → CONFIGURED → GENERATED → SAVED,
 * with REOPENED for edits. Mirrors the backend `SimulationState` enum; travels as
 * a string on the wire.
 */
export const SimulationState = {
  DRAFT: 'DRAFT',
  CONFIGURED: 'CONFIGURED',
  GENERATED: 'GENERATED',
  SAVED: 'SAVED',
  REOPENED: 'REOPENED',
} as const;

export type SimulationState = (typeof SimulationState)[keyof typeof SimulationState];
