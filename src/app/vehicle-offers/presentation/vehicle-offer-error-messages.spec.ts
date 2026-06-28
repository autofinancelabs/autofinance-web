import {ApiError} from '../../shared/infrastructure/api-error';
import {describeVehicleOfferError} from './vehicle-offer-error-messages';

describe('describeVehicleOfferError', () => {
  it('returns an empty view for null', () => {
    expect(describeVehicleOfferError(null)).toEqual({formMessage: null, fieldMessages: {}});
  });

  it('copies VALIDATION_FAILED field errors by field name', () => {
    const view = describeVehicleOfferError(
      new ApiError({
        status: 400,
        code: 'VALIDATION_FAILED',
        errors: [{field: 'salePrice', message: 'must be greater than 0'}],
      }),
    );
    expect(view.fieldMessages['salePrice']).toBe('must be greater than 0');
    expect(view.formMessage).toBeNull();
  });

  it('attributes INVALID_VEHICLE_OFFER to the salePrice field', () => {
    const view = describeVehicleOfferError(new ApiError({status: 400, code: 'INVALID_VEHICLE_OFFER'}));
    expect(view.fieldMessages['salePrice']).toContain('mayor que 0');
  });

  it('shows a form-level message for a 400 without field errors (e.g. bad currency)', () => {
    const view = describeVehicleOfferError(new ApiError({status: 400, detail: 'bad currency'}));
    expect(view.formMessage).toContain('Revisa');
  });
});
