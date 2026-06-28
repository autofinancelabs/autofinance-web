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
  Unauthenticated: 'UNAUTHENTICATED',
  AccessDenied: 'ACCESS_DENIED',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
