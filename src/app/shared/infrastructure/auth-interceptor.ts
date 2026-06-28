import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {environment} from '../../../environments/environment';
import {TokenStorage} from '../../iam/infrastructure/token-storage';

const apiBaseUrl = environment.platformProviderApiBaseUrl;
const signInUrl = `${apiBaseUrl}${environment.platformProviderSignInEndpointPath}`;
const dealershipsUrl = `${apiBaseUrl}${environment.platformProviderDealershipsEndpointPath}`;

/**
 * Attaches `Authorization: Bearer <token>` to outgoing API requests when a token
 * is stored. Public endpoints (sign-in, and dealership registration via POST) are
 * skipped, as are requests outside the configured API base URL.
 *
 * Injects only the leaf `TokenStorage` (never the `AuthStore`) to avoid a DI cycle.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = apiBaseUrl.length > 0 && req.url.startsWith(apiBaseUrl);
  const isPublic = req.url === signInUrl || (req.method === 'POST' && req.url === dealershipsUrl);

  if (!isApiRequest || isPublic) {
    return next(req);
  }

  const token = inject(TokenStorage).getToken();
  if (token === null) {
    return next(req);
  }

  return next(req.clone({setHeaders: {Authorization: `Bearer ${token}`}}));
};
