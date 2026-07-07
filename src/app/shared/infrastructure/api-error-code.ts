/**
 * Stable, machine-readable error codes returned by the AutoFinance API
 * (RFC 9457 `code` field). The frontend branches on these — never on `detail`.
 *
 * Modeled as a const object + derived union (instead of an enum) to avoid enum
 * runtime baggage and stay consistent with the codebase's type-first style.
 */
export const ApiErrorCode = {
  InvalidCredentials: 'INVALID_CREDENTIALS',
  ValidationFailed: 'VALIDATION_FAILED',
  DuplicateRuc: 'DUPLICATE_RUC',
  DuplicateEmail: 'DUPLICATE_EMAIL',
  DuplicateUsername: 'DUPLICATE_USERNAME',
  InvalidVehicleOffer: 'INVALID_VEHICLE_OFFER',
  DuplicateClientDocument: 'DUPLICATE_CLIENT_DOCUMENT',
  InvalidSimulationConfiguration: 'INVALID_SIMULATION_CONFIGURATION',
  InvalidCostConfiguration: 'INVALID_COST_CONFIGURATION',
  PercentageOutOfRange: 'PERCENTAGE_OUT_OF_RANGE',
  MissingCapitalization: 'MISSING_CAPITALIZATION',
  CurrencyMismatch: 'CURRENCY_MISMATCH',
  ScheduleNotBalanced: 'SCHEDULE_NOT_BALANCED',
  IrrNotBracketed: 'IRR_NOT_BRACKETED',
  ClientNotFound: 'CLIENT_NOT_FOUND',
  VehicleOfferNotFound: 'VEHICLE_OFFER_NOT_FOUND',
  Unauthenticated: 'UNAUTHENTICATED',
  AccessDenied: 'ACCESS_DENIED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
