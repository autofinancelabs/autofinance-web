import {signal, WritableSignal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {Currency} from '../../../../shared/domain/model/currency';
import {Money} from '../../../../shared/domain/model/money';
import {VehicleOffer} from '../../../domain/model/vehicle-offer.entity';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';
import {VehicleOffersList} from './vehicle-offers-list';

describe('VehicleOffersList', () => {
  let offers: WritableSignal<VehicleOffer[]>;
  let loading: WritableSignal<boolean>;
  let isEmpty: WritableSignal<boolean>;
  let store: {load: ReturnType<typeof vi.fn>};

  function setup(): ComponentFixture<VehicleOffersList> {
    offers = signal<VehicleOffer[]>([]);
    loading = signal(false);
    isEmpty = signal(true);
    store = {load: vi.fn(), offers, loading, isEmpty} as never;

    TestBed.configureTestingModule({
      imports: [VehicleOffersList],
      providers: [provideRouter([]), {provide: VehicleOffersStore, useValue: store}],
    });
    const fixture = TestBed.createComponent(VehicleOffersList);
    fixture.detectChanges();
    return fixture;
  }

  it('loads offers on init', () => {
    setup();
    expect(store.load).toHaveBeenCalledTimes(1);
  });

  it('renders offers with the formatted price', () => {
    const fixture = setup();
    offers.set([
      new VehicleOffer({
        id: 'o-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: new Money({amount: 25000, currency: Currency.PEN}),
        model3d: null,
      }),
    ]);
    isEmpty.set(false);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Toyota');
    expect(text).toContain('Camry');
    expect(text).toContain('25');
  });

  it('shows an empty state when there are no offers', () => {
    const fixture = setup();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Aún no has registrado');
  });
});
