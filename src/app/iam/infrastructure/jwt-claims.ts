/**
 * The JWT claims issued by the AutoFinance API.
 *
 * `sub` is the userId, `dealershipId` is the tenant, `exp` is the expiry
 * (seconds since epoch).
 */
export interface JwtClaims {
  sub: string;
  dealershipId: string;
  username: string;
  exp: number;
  iat?: number;
}

/**
 * Decodes (without verifying) the payload of a JWT. Verification is the
 * backend's job; the frontend only reads claims to rehydrate the session and
 * check expiry. Returns `null` for malformed tokens or missing/typed-wrong claims.
 */
export function decodeJwt(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (base64.length % 4)) % 4;
    const json = atob(base64.padEnd(base64.length + padding, '='));
    const claims = JSON.parse(json) as Partial<JwtClaims>;

    if (
      typeof claims.sub !== 'string' ||
      typeof claims.dealershipId !== 'string' ||
      typeof claims.username !== 'string' ||
      typeof claims.exp !== 'number'
    ) {
      return null;
    }

    return {
      sub: claims.sub,
      dealershipId: claims.dealershipId,
      username: claims.username,
      exp: claims.exp,
      iat: typeof claims.iat === 'number' ? claims.iat : undefined,
    };
  } catch {
    return null;
  }
}
