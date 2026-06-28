import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {TokenStorage} from '../../iam/infrastructure/token-storage';
import {ApiError} from './api-error';
import {ApiErrorCode} from './api-error-code';
import {NotificationService} from './notification.service';

/**
 * Converts every failed HTTP response into a typed {@link ApiError} (parsed from
 * the RFC 9457 body) and rethrows it, so callers branch on the stable `code`.
 *
 * Error UX policy:
 *  - **Operational** failures (network, 5xx, 403/404/405, expired session) are
 *    surfaced as a global toast here — they aren't tied to a form field.
 *  - **Input/validation** failures (400 VALIDATION_FAILED / INVALID_*, 409
 *    duplicates, 401 INVALID_CREDENTIALS) are NOT toasted: the view renders them
 *    inline next to the offending field.
 *
 * On `401 UNAUTHENTICATED` it also clears the stored token and redirects to
 * `/sign-in`.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorage);
  const router = inject(Router);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);

      if (apiError.status === 401 && apiError.is(ApiErrorCode.Unauthenticated)) {
        tokenStorage.clear();
        void router.navigate(['/sign-in']);
      }

      const operationalMessage = operationalMessageFor(apiError);
      if (operationalMessage !== null) {
        notification.error(operationalMessage);
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

/**
 * Returns the toast copy for an operational error, or `null` when the error is an
 * input/validation failure that the view handles inline.
 */
function operationalMessageFor(error: ApiError): string | null {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.';
  }
  if (error.status === 401 && error.is(ApiErrorCode.Unauthenticated)) {
    return 'Tu sesión expiró. Inicia sesión nuevamente.';
  }
  if (error.status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }
  if (error.status === 404) {
    return 'El recurso solicitado no existe.';
  }
  if (error.status === 405) {
    return 'Operación no permitida.';
  }
  if (error.status >= 500) {
    return 'Ocurrió un error en el servidor. Inténtalo de nuevo.';
  }
  return null;
}
