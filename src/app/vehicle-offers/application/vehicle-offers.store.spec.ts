import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {ApiError} from '../../shared/infrastructure/api-error';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOffersApi} from '../infrastructure/vehicle-offers-api';
import {VehicleOffersStore} from './vehicle-offers.store';

function makeOffer(id = 'o-1'): VehicleOffer {
  return new VehicleOffer({
    id,
    make: 'Honda',
    model: 'Accord',
    year: 2022,
    salePrice: new Money({amount: 30000, currency: Currency.PEN}),
  });
}

function makeDraft(): VehicleOfferDraft {
  return new VehicleOfferDraft({
    make: 'Honda',
    model: 'Accord',
    year: 2022,
    salePrice: 30000,
    currency: Currency.PEN,
  });
}

describe('VehicleOffersStore', () => {
  let api: {
    getAll: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  function createStore(): VehicleOffersStore {
    TestBed.configureTestingModule({
      providers: [VehicleOffersStore, {provide: VehicleOffersApi, useValue: api}],
    });
    return TestBed.inject(VehicleOffersStore);
  }

  beforeEach(() => {
    api = {getAll: vi.fn(), getById: vi.fn(), create: vi.fn(), update: vi.fn()};
  });

  it('load populates offers', () => {
    api.getAll.mockReturnValue(of([makeOffer('o-1'), makeOffer('o-2')]));
    const store = createStore();
    store.load();
    expect(store.offers()).toHaveLength(2);
    expect(store.loading()).toBe(false);
  });

  it('load failure captures the ApiError', () => {
    const error = new ApiError({status: 500, code: 'INTERNAL_ERROR'});
    api.getAll.mockReturnValue(throwError(() => error));
    const store = createStore();
    store.load();
    expect(store.error()).toBe(error);
  });

  it('create success flips saved', () => {
    api.create.mockReturnValue(of(makeOffer()));
    const store = createStore();
    store.create(makeDraft());
    expect(store.saved()).toBe(true);
    expect(store.saving()).toBe(false);
  });

  it('create failure sets error and does not flip saved', () => {
    const error = new ApiError({status: 400, code: 'INVALID_VEHICLE_OFFER'});
    api.create.mockReturnValue(throwError(() => error));
    const store = createStore();
    store.create(makeDraft());
    expect(store.error()).toBe(error);
    expect(store.saved()).toBe(false);
  });

  it('loadOne sets the selected offer', () => {
    api.getById.mockReturnValue(of(makeOffer('o-9')));
    const store = createStore();
    store.loadOne('o-9');
    expect(store.selected()?.id).toBe('o-9');
  });
});
