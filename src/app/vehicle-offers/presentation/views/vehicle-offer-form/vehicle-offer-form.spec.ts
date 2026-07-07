import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {ApiError} from '../../../../shared/infrastructure/api-error';
import {VehicleOffer} from '../../../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../../../domain/model/vehicle-offer-draft.command';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';
import {VehicleOfferForm} from './vehicle-offer-form';

const flush = () => new Promise(resolve => setTimeout(resolve));

interface FormModel {
  make: string;
  model: string;
  year: number | null;
  salePrice: number | null;
  currency: string;
}

const validModel: FormModel = {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  salePrice: 25000,
  currency: 'PEN',
};

describe('VehicleOfferForm (create)', () => {
  let saving: WritableSignal<boolean>;
  let error: WritableSignal<ApiError | null>;
  let saved: WritableSignal<boolean>;
  let selected: WritableSignal<VehicleOffer | null>;
  let store: {create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>};
  let router: {navigate: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<VehicleOfferForm> {
    saving = signal(false);
    error = signal<ApiError | null>(null);
    saved = signal(false);
    selected = signal<VehicleOffer | null>(null);
    store = {
      create: vi.fn(),
      update: vi.fn(),
      loadOne: vi.fn(),
      resetWriteState: vi.fn(),
      saving,
      error,
      saved,
      selected,
    } as never;
    router = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [VehicleOfferForm],
      providers: [
        {provide: VehicleOffersStore, useValue: store},
        {provide: Router, useValue: router},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({})}}},
      ],
    });
    const fixture = TestBed.createComponent(VehicleOfferForm);
    fixture.detectChanges();
    return fixture;
  }

  function instance(fixture: ComponentFixture<VehicleOfferForm>) {
    return fixture.componentInstance as unknown as {
      model: WritableSignal<FormModel>;
      onSubmit: (e: Event) => void;
    };
  }

  it('submits a valid draft via create()', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();

    expect(store.create).toHaveBeenCalledTimes(1);
    const draft = store.create.mock.calls[0][0] as VehicleOfferDraft;
    expect(draft).toBeInstanceOf(VehicleOfferDraft);
    expect(draft.make).toBe('Toyota');
    expect(draft.salePrice).toBe(25000);
  });

  it('blocks submit and shows an error when salePrice is 0', async () => {
    const fixture = setup();
    instance(fixture).model.set({...validModel, salePrice: 0});
    instance(fixture).onSubmit(new Event('submit'));
    await flush();
    fixture.detectChanges();

    expect(store.create).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('mayor que 0');
  });

  it('navigates to the list once saved', () => {
    const fixture = setup();
    saved.set(true);
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith(['/vehicle-offers']);
  });
});
