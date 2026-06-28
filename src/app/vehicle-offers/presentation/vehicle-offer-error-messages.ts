import {ApiError} from '../../shared/infrastructure/api-error';
import {ApiErrorCode} from '../../shared/infrastructure/api-error-code';

/**
 * Presentation view of a vehicle-offer {@link ApiError}: a form-level message
 * plus per-field messages keyed by the form field name (which matches the backend
 * field names: make, model, year, salePrice).
 *
 * Operational failures are surfaced by the global toast (error interceptor), not
 * here — so there is no generic fallback.
 */
export interface VehicleOfferErrorView {
  formMessage: string | null;
  fieldMessages: Record<string, string>;
}

export function describeVehicleOfferError(error: ApiError | null): VehicleOfferErrorView {
  if (error === null) {
    return {formMessage: null, fieldMessages: {}};
  }

  const fieldMessages: Record<string, string> = {};
  for (const fieldError of error.fieldErrors) {
    fieldMessages[fieldError.field] = fieldError.message;
  }

  // INVALID_VEHICLE_OFFER (sale price ≤ 0) carries no errors[]: attribute it to
  // the salePrice field. Other 400s without errors[] (bad currency, incomplete
  // plan) are shown as a form-level message.
  let formMessage: string | null = null;
  if (error.is(ApiErrorCode.InvalidVehicleOffer)) {
    fieldMessages['salePrice'] = 'El precio de venta debe ser mayor que 0.';
  } else if (error.status === 400 && Object.keys(fieldMessages).length === 0) {
    formMessage = 'Revisa los datos de la oferta e inténtalo de nuevo.';
  }

  return {formMessage, fieldMessages};
}
