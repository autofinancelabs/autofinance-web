import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {AuthStore} from '../../../../iam/application/auth.store';
import {AuthenticatedUser} from '../../../../iam/domain/model/authenticated-user.entity';
import {Dashboard} from './dashboard';

describe('Dashboard', () => {
  it('greets the user and links to the vehicle offers area', () => {
    const currentUser = signal<AuthenticatedUser | null>(
      new AuthenticatedUser({id: 'u-1', username: 'ana', dealershipId: 'd-1', token: 't'}),
    );
    TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), {provide: AuthStore, useValue: {currentUser}}],
    });
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hola, ana');
    expect(el.querySelector('a[href="/vehicle-offers"]')).not.toBeNull();
  });
});
