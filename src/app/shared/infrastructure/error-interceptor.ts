import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {TokenStorage} from '../../iam/infrastructure/token-storage';
import {ApiError} from './api-error';
import {ApiErrorCode} from './api-error-code';
import {NotificationService} from './notification.service';

/**
 * Converts every failed HTTP response into a typed {@link ApiError}, surfaces it
 * as a global toast, and rethrows it.
 *
 * Error UX policy: **all backend errors are toasts**; only client-side (Signal
 * Forms) validation is shown inline next to the field. On `401 UNAUTHENTICATED`
 * it also clears the stored token and redirects to `/sign-in`.
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

      notification.error(messageFor(apiError));
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

/** Maps an {@link ApiError} to Spanish toast copy (by stable code, then status). */
function messageFor(error: ApiError): string {
  switch (error.code) {
    case ApiErrorCode.InvalidCredentials:
      return 'Usuario o contraseña incorrectos.';
    case ApiErrorCode.DuplicateRuc:
      return 'Ya existe una concesionaria con este RUC.';
    case ApiErrorCode.DuplicateEmail:
      return 'Este correo electrónico ya está registrado.';
    case ApiErrorCode.DuplicateUsername:
      return 'Este nombre de usuario ya está en uso.';
    case ApiErrorCode.InvalidVehicleOffer:
      return 'El precio de venta debe ser mayor que 0.';
    case ApiErrorCode.ValidationFailed:
      return 'Revisa los datos del formulario e inténtalo de nuevo.';
    case ApiErrorCode.Unauthenticated:
      return 'Tu sesión expiró. Inicia sesión nuevamente.';
    case ApiErrorCode.AccessDenied:
      return 'No tienes permiso para realizar esta acción.';
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.';
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
  return 'Ocurrió un error. Inténtalo de nuevo.';
}
