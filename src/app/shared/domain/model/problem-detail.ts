/**
 * Typed mirror of the backend's RFC 9457 `application/problem+json` error body.
 *
 * The frontend reasons about the stable, machine-readable `code` — never the
 * human-facing `detail` (which is for developers and may change).
 */
export interface FieldError {
  /** Name of the offending input field. */
  field: string;
  /** Validation message for that field. */
  message: string;
}

/**
 * RFC 9457 Problem Details payload as returned by the AutoFinance API.
 */
export interface ProblemDetail {
  /** HTTP status code. Always present. */
  status: number;
  /** URI reference identifying the problem type. */
  type?: string;
  /** Short, human-readable summary of the problem type. */
  title?: string;
  /** Human-readable explanation (for developers, not end users). */
  detail?: string;
  /** URI reference identifying the specific occurrence. */
  instance?: string;
  /** Stable, machine-readable error code the frontend branches on. */
  code?: string;
  /** ISO-8601 UTC timestamp of the error. */
  timestamp?: string;
  /** Field-level validation errors (present on `VALIDATION_FAILED`). */
  errors?: FieldError[];
}
