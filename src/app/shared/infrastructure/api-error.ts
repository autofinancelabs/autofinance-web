import {HttpErrorResponse} from '@angular/common/http';
import {FieldError, ProblemDetail} from '../domain/model/problem-detail';
import {ApiErrorCode} from './api-error-code';

/**
 * Typed application error built from an RFC 9457 `ProblemDetail`.
 *
 * The error interceptor converts every failed HTTP response into an `ApiError`
 * and rethrows it, so application-layer callers can branch on the stable `code`
 * (via {@link ApiError.is}) instead of inspecting raw `HttpErrorResponse`.
 */
export class ApiError extends Error {
  /** HTTP status code (0 for network/CORS/non-JSON failures). */
  readonly status: number;
  /** Stable backend error code, when present. */
  readonly code: string | undefined;
  /** Field-level validation errors (empty unless `VALIDATION_FAILED`). */
  readonly fieldErrors: FieldError[];
  /** The full parsed problem payload. */
  readonly problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${problem.status}`);
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.fieldErrors = problem.errors ?? [];
    this.problem = problem;
  }

  /**
   * Builds an `ApiError` from an Angular `HttpErrorResponse`, tolerating bodies
   * that are not RFC 9457 (non-JSON responses, network failures → status 0).
   */
  static fromHttp(error: HttpErrorResponse): ApiError {
    const body: unknown = error.error;
    if (body !== null && typeof body === 'object' && 'status' in body) {
      return new ApiError(body as ProblemDetail);
    }
    return new ApiError({
      status: error.status,
      title: error.statusText,
      detail: error.message,
    });
  }

  /** Returns true when this error carries the given stable code. */
  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }
}
