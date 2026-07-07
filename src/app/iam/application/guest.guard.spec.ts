import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree} from '@angular/router';
import {AuthStore} from './auth.store';
import {guestGuard} from './guest.guard';

describe('guestGuard', () => {
  let authenticated: boolean;

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as boolean | UrlTree,
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

  it('allows guests onto the auth screens', () => {
    authenticated = false;
    expect(runGuard()).toBe(true);
  });

  it('redirects authenticated users to /dashboard', () => {
    authenticated = true;
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/dashboard');
  });
});
