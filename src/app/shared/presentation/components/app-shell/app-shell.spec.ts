import {signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {AuthStore} from '../../../../iam/application/auth.store';
import {AuthenticatedUser} from '../../../../iam/domain/model/authenticated-user.entity';
import {AppShell} from './app-shell';

describe('AppShell', () => {
  let currentUser: WritableSignal<AuthenticatedUser | null>;
  let store: {signOut: ReturnType<typeof vi.fn>};

  function setup() {
    currentUser = signal<AuthenticatedUser | null>(
      new AuthenticatedUser({id: 'u-1', username: 'ana', dealershipId: 'd-1', token: 't'}),
    );
    store = {signOut: vi.fn(), currentUser} as never;
    TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([]), {provide: AuthStore, useValue: store}],
    });
    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the nav items and the current user', () => {
    const text = (setup().nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Dashboard');
    expect(text).toContain('Vehículos');
    expect(text).toContain('ana');
  });

  it('signs out: clears the session and navigates to /sign-in', () => {
    const fixture = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.sidebar__signout')!.click();
    expect(store.signOut).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/sign-in']);
  });

  it('toggles the mobile drawer', () => {
    const fixture = setup();
    const component = fixture.componentInstance as unknown as {drawerOpen: () => boolean};
    expect(component.drawerOpen()).toBe(false);
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.topbar__menu')!.click();
    expect(component.drawerOpen()).toBe(true);
  });
});
