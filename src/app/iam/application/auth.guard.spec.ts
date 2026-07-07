import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree} from '@angular/router';
import {authGuard} from './auth.guard';
import {AuthStore} from './auth.store';

describe('authGuard', () => {
  let authenticated: boolean;

  function runGuard(url: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        authGuard({} as ActivatedRouteSnapshot, {url} as RouterStateSnapshot) as boolean | UrlTree,
    );
  }

  beforeEach(() => {
    authenticated = false;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {provide: AuthStore, useValue: {isAuthenticated: () => authenticated}},
      ],
    });
  });

  it('allows activation for an authenticated session', () => {
    authenticated = true;
    expect(runGuard('/dashboard')).toBe(true);
  });

  it('redirects to /sign-in with redirectTo when unauthenticated', () => {
    authenticated = false;
    const result = runGuard('/dashboard');
    expect(result).toBeInstanceOf(UrlTree);
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('/sign-in');
    expect(tree.queryParams['redirectTo']).toBe('/dashboard');
  });
});
