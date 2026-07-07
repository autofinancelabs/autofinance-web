import {Currency} from '../../shared/domain/model/currency';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOfferAssembler} from './vehicle-offer-assembler';

describe('VehicleOfferAssembler', () => {
  const assembler = new VehicleOfferAssembler();

  it('maps a draft to a flat request', () => {
    const request = assembler.toRequestFromDraft(
      new VehicleOfferDraft({
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: 25000,
        currency: Currency.PEN,
      }),
    );
    expect(request).toEqual({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      salePrice: 25000,
      currency: 'PEN',
    });
  });

  it('maps a response (nested money) to the entity', () => {
    const entity = assembler.toEntityFromResource({
      id: 'o-1',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      salePrice: {amount: 30000, currency: 'USD'},
    });
    expect(entity.id).toBe('o-1');
    expect(entity.salePrice.amount).toBe(30000);
    expect(entity.salePrice.currency).toBe('USD');
  });

  it('maps a list of resources', () => {
    const entities = assembler.toEntitiesFromResource([
      {
        id: 'o-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: {amount: 25000, currency: 'PEN'},
      },
    ]);
    expect(entities).toHaveLength(1);
    expect(entities[0].make).toBe('Toyota');
  });
});
