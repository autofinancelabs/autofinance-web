import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {ApiError} from '../../shared/infrastructure/api-error';
import {AuthenticatedUser} from '../domain/model/authenticated-user.entity';
import {Credentials} from '../domain/model/credentials.command';
import {Dealership} from '../domain/model/dealership.entity';
import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {IamApi} from '../infrastructure/iam-api';
import {TokenStorage} from '../infrastructure/token-storage';
import {AuthStore} from './auth.store';

/** Builds an unsigned JWT string with the given payload. */
function makeJwt(payload: object): string {
  const encode = (value: object): string =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode({alg: 'HS256', typ: 'JWT'})}.${encode(payload)}.signature`;
}

describe('AuthStore', () => {
  let api: {signIn: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn>};
  let tokenStorage: {
    getToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  function createStore(): AuthStore {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        {provide: IamApi, useValue: api},
        {provide: TokenStorage, useValue: tokenStorage},
      ],
    });
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => {
    api = {signIn: vi.fn(), register: vi.fn()};
    tokenStorage = {getToken: vi.fn().mockReturnValue(null), setToken: vi.fn(), clear: vi.fn()};
  });

  it('signs in successfully: sets currentUser, persists token, becomes authenticated', () => {
    const user = new AuthenticatedUser({id: 'u-1', username: 'ana', dealershipId: 'd-1', token: 'jwt'});
    api.signIn.mockReturnValue(of(user));
    const store = createStore();

    store.signIn(new Credentials({identifier: 'ana', password: 'pw'}));

    expect(tokenStorage.setToken).toHaveBeenCalledWith('jwt');
    expect(store.currentUser()).toBe(user);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('captures the ApiError on a failed sign-in and stays unauthenticated', () => {
    const error = new ApiError({status: 401, code: 'INVALID_CREDENTIALS'});
    api.signIn.mockReturnValue(throwError(() => error));
    const store = createStore();

    store.signIn(new Credentials({identifier: 'ana', password: 'bad'}));

    expect(store.error()).toBe(error);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.loading()).toBe(false);
  });

  it('registers successfully without authenticating the session', () => {
    const dealership = new Dealership({id: 'd-1', name: 'AutoNorte', ruc: '20123456789', contactEmail: null});
    api.register.mockReturnValue(of(dealership));
    const store = createStore();

    store.register(
      new DealershipRegistration({
        name: 'AutoNorte',
        ruc: '20123456789',
        contactEmail: null,
        userEmail: 'ana@autonorte.pe',
        username: 'ana',
        password: 'pw',
      }),
    );

    expect(store.registeredDealership()).toBe(dealership);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('signs out: clears the token and the current user', () => {
    const user = new AuthenticatedUser({id: 'u-1', username: 'ana', dealershipId: 'd-1', token: 'jwt'});
    api.signIn.mockReturnValue(of(user));
    const store = createStore();
    store.signIn(new Credentials({identifier: 'ana', password: 'pw'}));

    store.signOut();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentUser()).toBeNull();
  });

  it('rehydrates the session from a valid stored token', () => {
    const token = makeJwt({
      sub: 'u-9',
      dealershipId: 'd-9',
      username: 'leo',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    tokenStorage.getToken.mockReturnValue(token);

    const store = createStore();

    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUser()?.id).toBe('u-9');
    expect(store.currentUser()?.dealershipId).toBe('d-9');
    expect(store.currentUser()?.username).toBe('leo');
  });

  it('clears an expired stored token on startup', () => {
    const token = makeJwt({
      sub: 'u-9',
      dealershipId: 'd-9',
      username: 'leo',
      exp: Math.floor(Date.now() / 1000) - 10,
    });
    tokenStorage.getToken.mockReturnValue(token);

    const store = createStore();

    expect(store.isAuthenticated()).toBe(false);
    expect(tokenStorage.clear).toHaveBeenCalled();
  });
});
