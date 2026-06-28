import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {TokenStorage} from '../../iam/infrastructure/token-storage';
import {ApiError} from './api-error';
import {ApiErrorCode} from './api-error-code';

/**
 * Converts every failed HTTP response into a typed {@link ApiError} (parsed from
 * the RFC 9457 body) and rethrows it, so callers branch on the stable `code`.
 *
 * On a `401 UNAUTHENTICATED` (an expired/invalid session on a protected endpoint)
 * it clears the stored token and redirects to `/sign-in`. It deliberately does
 * NOT do this for `INVALID_CREDENTIALS`, which is just a failed login attempt.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);

      if (apiError.status === 401 && apiError.is(ApiErrorCode.Unauthenticated)) {
        tokenStorage.clear();
        void router.navigate(['/sign-in']);
      }

      return throwError(() => apiError);
    }),
  );
};

function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    return ApiError.fromHttp(error);
  }
  if (error instanceof ApiError) {
    return error;
  }
  return new ApiError({
    status: 0,
    detail: error instanceof Error ? error.message : 'Unknown error',
  });
}
