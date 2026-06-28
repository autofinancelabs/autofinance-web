import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ApiError} from '../../../../shared/infrastructure/api-error';
import {AuthStore} from '../../../application/auth.store';
import {Credentials} from '../../../domain/model/credentials.command';
import {SignIn} from './sign-in';

const flush = () => new Promise(resolve => setTimeout(resolve));

describe('SignIn', () => {
  let isAuthenticated: WritableSignal<boolean>;
  let loading: WritableSignal<boolean>;
  let error: WritableSignal<ApiError | null>;
  let store: {signIn: ReturnType<typeof vi.fn>};
  let router: {navigateByUrl: ReturnType<typeof vi.fn>};

  function setup(queryParams: Record<string, string> = {}): ComponentFixture<SignIn> {
    isAuthenticated = signal(false);
    loading = signal(false);
    error = signal<ApiError | null>(null);
    store = {signIn: vi.fn(), isAuthenticated, loading, error} as never;
    router = {navigateByUrl: vi.fn()};

    TestBed.configureTestingModule({
      imports: [SignIn],
      providers: [
        {provide: AuthStore, useValue: store},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: convertToParamMap(queryParams)}}},
      ],
    });
    const fixture = TestBed.createComponent(SignIn);
    fixture.detectChanges();
    return fixture;
  }

  it('submits the typed credentials to the store', async () => {
    const fixture = setup();
    const component = fixture.componentInstance as unknown as {
      model: WritableSignal<{identifier: string; password: string}>;
      onSubmit: (e: Event) => void;
    };
    component.model.set({identifier: 'ana', password: 's3cret'});

    component.onSubmit(new Event('submit'));
    await flush();

    expect(store.signIn).toHaveBeenCalledTimes(1);
    const arg = store.signIn.mock.calls[0][0] as Credentials;
    expect(arg).toBeInstanceOf(Credentials);
    expect(arg.identifier).toBe('ana');
    expect(arg.password).toBe('s3cret');
  });

  it('navigates to the redirectTo target once authenticated', () => {
    const fixture = setup({redirectTo: '/clients'});
    isAuthenticated.set(true);
    fixture.detectChanges();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/clients');
  });

  it('defaults the post-login redirect to /dashboard', () => {
    const fixture = setup();
    isAuthenticated.set(true);
    fixture.detectChanges();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('disables the submit button while loading', () => {
    const fixture = setup();
    loading.set(true);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      'button[hlmBtn]',
    ) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows the success notice when registered=true', () => {
    const fixture = setup({registered: 'true'});
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Registro exitoso');
  });
});
