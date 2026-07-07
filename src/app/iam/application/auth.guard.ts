import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStore} from './auth.store';

/**
 * Route guard that allows navigation only for an authenticated session.
 * Otherwise redirects to `/sign-in`, preserving the attempted URL in
 * `redirectTo` so the user can be returned after signing in.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/sign-in'], {queryParams: {redirectTo: state.url}});
};
