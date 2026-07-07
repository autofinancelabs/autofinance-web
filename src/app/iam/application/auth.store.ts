import {computed, inject, Service, signal} from '@angular/core';
import {ApiError} from '../../shared/infrastructure/api-error';
import {AuthenticatedUser} from '../domain/model/authenticated-user.entity';
import {Credentials} from '../domain/model/credentials.command';
import {Dealership} from '../domain/model/dealership.entity';
import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {IamApi} from '../infrastructure/iam-api';
import {decodeJwt} from '../infrastructure/jwt-claims';
import {TokenStorage} from '../infrastructure/token-storage';

/**
 * Signal-based store for the IAM bounded context: holds the authenticated session
 * and orchestrates sign-in, dealership registration, and sign-out.
 *
 * On construction it rehydrates the session from the stored JWT (validating
 * expiry), so `isAuthenticated` survives a page reload.
 */
@Service()
export class AuthStore {
  private readonly api = inject(IamApi);
  private readonly tokenStorage = inject(TokenStorage);

  private readonly currentUserSignal = signal<AuthenticatedUser | null>(this.restoreSession());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<ApiError | null>(null);
  private readonly registeredDealershipSignal = signal<Dealership | null>(null);

  /** The authenticated session principal, or `null` when signed out. */
  readonly currentUser = this.currentUserSignal.asReadonly();
  /** True while a sign-in or registration request is in flight. */
  readonly loading = this.loadingSignal.asReadonly();
  /** The last `ApiError` from sign-in/registration, or `null`. */
  readonly error = this.errorSignal.asReadonly();
  /** The dealership produced by the last successful registration, or `null`. */
  readonly registeredDealership = this.registeredDealershipSignal.asReadonly();
  /** Whether there is an authenticated session. */
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  signIn(credentials: Credentials): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.signIn(credentials).subscribe({
      next: user => {
        this.tokenStorage.setToken(user.token);
        this.currentUserSignal.set(user);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  register(registration: DealershipRegistration): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.registeredDealershipSignal.set(null);
    this.api.register(registration).subscribe({
      next: dealership => {
        // Registration does not authenticate: the backend returns no token, so
        // the user must sign in afterwards.
        this.registeredDealershipSignal.set(dealership);
        this.loadingSignal.set(false);
      },
      error: (error: ApiError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  signOut(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  /** Rebuilds the session from a stored, non-expired JWT, or clears it. */
  private restoreSession(): AuthenticatedUser | null {
    const token = this.tokenStorage.getToken();
    if (token === null) {
      return null;
    }
    const claims = decodeJwt(token);
    if (claims === null || claims.exp * 1000 <= Date.now()) {
      this.tokenStorage.clear();
      return null;
    }
    return new AuthenticatedUser({
      id: claims.sub,
      username: claims.username,
      dealershipId: claims.dealershipId,
      token,
    });
  }
}
