import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '@angular/router';
import {AuthStore} from '../../../../iam/application/auth.store';
import {Landing} from './landing';

function configure(authenticated: boolean): Router {
  TestBed.configureTestingModule({
    imports: [Landing],
    providers: [
      provideRouter([]),
      {provide: AuthStore, useValue: {isAuthenticated: signal(authenticated)}},
    ],
  });
  return TestBed.inject(Router);
}

describe('Landing', () => {
  it('renders the hero and a sign-in call to action for guests', () => {
    configure(false);
    const fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.hero__title')).not.toBeNull();
    const cta = el.querySelector<HTMLAnchorElement>('.hero__actions a[href]');
    expect(cta?.getAttribute('href')).toBe('/sign-in');
  });

  it('does not redirect a guest away from the landing', () => {
    const router = configure(false);
    const navigate = vi.spyOn(router, 'navigate');
    TestBed.createComponent(Landing).detectChanges();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('redirects an authenticated user to the dashboard', () => {
    const router = configure(true);
    const navigate = vi.spyOn(router, 'navigate');
    TestBed.createComponent(Landing).detectChanges();
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
