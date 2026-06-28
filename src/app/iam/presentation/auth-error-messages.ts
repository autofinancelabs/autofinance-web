import {ApiError} from '../../shared/infrastructure/api-error';
import {ApiErrorCode} from '../../shared/infrastructure/api-error-code';

/**
 * Presentation view of an {@link ApiError} for the auth screens: a top-level
 * banner message plus per-field messages keyed by the FORM field name (which
 * matches the backend field names: name, ruc, userEmail, username, password).
 */
export interface AuthErrorView {
  formMessage: string | null;
  fieldMessages: Record<string, string>;
}

/**
 * Translates an {@link ApiError} into Spanish copy for the auth forms, branching
 * on the stable `code`. Validation field errors are copied straight through (the
 * backend field names match the form field names); 409 duplicates are mapped to
 * the owning field.
 */
export function describeAuthError(error: ApiError | null): AuthErrorView {
  if (error === null) {
    return {formMessage: null, fieldMessages: {}};
  }

  const fieldMessages: Record<string, string> = {};
  for (const fieldError of error.fieldErrors) {
    fieldMessages[fieldError.field] = fieldError.message;
  }

  if (error.is(ApiErrorCode.DuplicateRuc)) {
    fieldMessages['ruc'] = 'Ya existe una concesionaria con este RUC.';
  }
  if (error.is(ApiErrorCode.DuplicateUsername)) {
    fieldMessages['username'] = 'Este nombre de usuario ya está en uso.';
  }
  if (error.is(ApiErrorCode.DuplicateEmail)) {
    fieldMessages['userEmail'] = 'Este correo electrónico ya está registrado.';
  }

  let formMessage: string | null = null;
  if (error.is(ApiErrorCode.InvalidCredentials)) {
    formMessage = 'Usuario o contraseña incorrectos.';
  } else if (Object.keys(fieldMessages).length === 0) {
    formMessage = 'No se pudo completar la operación. Inténtalo de nuevo.';
  }

  return {formMessage, fieldMessages};
}
