import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ApiError} from '../../../../shared/infrastructure/api-error';
import {AuthStore} from '../../../application/auth.store';
import {Dealership} from '../../../domain/model/dealership.entity';
import {DealershipRegistration} from '../../../domain/model/dealership-registration.command';
import {SignUp} from './sign-up';

const flush = () => new Promise(resolve => setTimeout(resolve));

interface RegisterModel {
  name: string;
  ruc: string;
  contactEmail: string;
  userEmail: string;
  username: string;
  password: string;
}

const validModel: RegisterModel = {
  name: 'AutoNorte SAC',
  ruc: '20123456789',
  contactEmail: '',
  userEmail: 'ana@autonorte.pe',
  username: 'ana',
  password: 'password1',
};

describe('SignUp', () => {
  let registeredDealership: WritableSignal<Dealership | null>;
  let loading: WritableSignal<boolean>;
  let error: WritableSignal<ApiError | null>;
  let store: {register: ReturnType<typeof vi.fn>};
  let router: {navigate: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<SignUp> {
    registeredDealership = signal<Dealership | null>(null);
    loading = signal(false);
    error = signal<ApiError | null>(null);
    store = {register: vi.fn(), registeredDealership, loading, error} as never;
    router = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [SignUp],
      providers: [
        {provide: AuthStore, useValue: store},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {queryParamMap: convertToParamMap({})}}},
      ],
    });
    const fixture = TestBed.createComponent(SignUp);
    fixture.detectChanges();
    return fixture;
  }

  function instance(fixture: ComponentFixture<SignUp>) {
    return fixture.componentInstance as unknown as {
      model: WritableSignal<RegisterModel>;
      onSubmit: (e: Event) => void;
    };
  }

  it('blocks submit and shows required errors when empty', async () => {
    const fixture = setup();
    instance(fixture).onSubmit(new Event('submit'));
    await flush();
    fixture.detectChanges();

    expect(store.register).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });

  it('rejects a RUC that is not 11 digits', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, ruc: '123'});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();
    fixture.detectChanges();

    expect(store.register).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('11 dígitos');
  });

  it('submits a valid registration with contactEmail null when blank', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.register).toHaveBeenCalledTimes(1);
    const arg = store.register.mock.calls[0][0] as DealershipRegistration;
    expect(arg).toBeInstanceOf(DealershipRegistration);
    expect(arg.ruc).toBe('20123456789');
    expect(arg.contactEmail).toBeNull();
  });

  it('maps a DUPLICATE_RUC error to the ruc field', () => {
    const fixture = setup();
    error.set(new ApiError({status: 409, code: 'DUPLICATE_RUC'}));
    fixture.detectChanges();
    const el = (fixture.nativeElement as HTMLElement).querySelector('#ruc-error');
    expect(el?.textContent).toContain('RUC');
  });

  it('maps VALIDATION_FAILED field errors to the matching field', () => {
    const fixture = setup();
    error.set(
      new ApiError({
        status: 400,
        code: 'VALIDATION_FAILED',
        errors: [{field: 'username', message: 'ya existe'}],
      }),
    );
    fixture.detectChanges();
    const el = (fixture.nativeElement as HTMLElement).querySelector('#username-error');
    expect(el?.textContent).toContain('ya existe');
  });

  it('navigates to /sign-in after a successful registration', () => {
    const fixture = setup();
    registeredDealership.set(
      new Dealership({id: 'd-1', name: 'AutoNorte SAC', ruc: '20123456789', contactEmail: null}),
    );
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in'], {queryParams: {registered: 'true'}});
  });
});
