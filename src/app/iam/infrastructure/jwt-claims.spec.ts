import {decodeJwt} from './jwt-claims';

/** Builds an unsigned JWT string with the given payload (base64url, no padding). */
function makeJwt(payload: object): string {
  const encode = (value: object): string =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({alg: 'HS256', typ: 'JWT'})}.${encode(payload)}.signature`;
}

describe('decodeJwt', () => {
  it('decodes valid claims', () => {
    const token = makeJwt({
      sub: 'u-1',
      dealershipId: 'd-1',
      username: 'ana',
      exp: 1700000000,
      iat: 1699000000,
    });
    expect(decodeJwt(token)).toEqual({
      sub: 'u-1',
      dealershipId: 'd-1',
      username: 'ana',
      exp: 1700000000,
      iat: 1699000000,
    });
  });

  it('returns null for a structurally malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('only.two')).toBeNull();
  });

  it('returns null when a required claim is missing', () => {
    expect(decodeJwt(makeJwt({sub: 'u-1'}))).toBeNull();
  });

  it('returns null when exp has the wrong type', () => {
    expect(
      decodeJwt(makeJwt({sub: 'u-1', dealershipId: 'd-1', username: 'ana', exp: 'soon'})),
    ).toBeNull();
  });
});
