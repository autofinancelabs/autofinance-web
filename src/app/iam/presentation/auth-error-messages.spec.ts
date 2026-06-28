import {ApiError} from '../../shared/infrastructure/api-error';
import {describeAuthError} from './auth-error-messages';

describe('describeAuthError', () => {
  it('returns empty view for a null error', () => {
    expect(describeAuthError(null)).toEqual({formMessage: null, fieldMessages: {}});
  });

  it('maps INVALID_CREDENTIALS to a form-level banner', () => {
    const view = describeAuthError(new ApiError({status: 401, code: 'INVALID_CREDENTIALS'}));
    expect(view.formMessage).toBe('Usuario o contraseña incorrectos.');
    expect(view.fieldMessages).toEqual({});
  });

  it('maps duplicate codes to their owning field, with no banner', () => {
    expect(describeAuthError(new ApiError({status: 409, code: 'DUPLICATE_RUC'})).fieldMessages['ruc'])
      .toContain('RUC');
    expect(
      describeAuthError(new ApiError({status: 409, code: 'DUPLICATE_USERNAME'})).fieldMessages[
        'username'
      ],
    ).toBeTruthy();
    expect(
      describeAuthError(new ApiError({status: 409, code: 'DUPLICATE_EMAIL'})).fieldMessages[
        'userEmail'
      ],
    ).toBeTruthy();
    expect(describeAuthError(new ApiError({status: 409, code: 'DUPLICATE_RUC'})).formMessage).toBeNull();
  });

  it('copies VALIDATION_FAILED field errors by field name', () => {
    const view = describeAuthError(
      new ApiError({
        status: 400,
        code: 'VALIDATION_FAILED',
        errors: [{field: 'ruc', message: 'must be 11 digits'}],
      }),
    );
    expect(view.fieldMessages['ruc']).toBe('must be 11 digits');
    expect(view.formMessage).toBeNull();
  });

  it('does not produce a banner for an operational error (handled by toast)', () => {
    const view = describeAuthError(new ApiError({status: 500, code: 'INTERNAL_ERROR'}));
    expect(view.formMessage).toBeNull();
    expect(view.fieldMessages).toEqual({});
  });
});
