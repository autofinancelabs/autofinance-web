import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStore} from './auth.store';

/**
 * Route guard for the auth screens (sign-in, sign-up): keeps already-authenticated
 * users out of them, redirecting to `/dashboard`.
 */
export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};
