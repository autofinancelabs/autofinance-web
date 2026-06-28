import {Currency} from '../../shared/domain/model/currency';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOfferAssembler} from './vehicle-offer-assembler';

describe('VehicleOfferAssembler', () => {
  const assembler = new VehicleOfferAssembler();

  it('maps a draft to a flat request, including the plan when complete', () => {
    const request = assembler.toRequestFromDraft(
      new VehicleOfferDraft({
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: 25000,
        currency: Currency.PEN,
        planName: 'Plan 36',
        planInstallments: 36,
      }),
    );
    expect(request).toEqual({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      salePrice: 25000,
      currency: 'PEN',
      planName: 'Plan 36',
      planInstallments: 36,
    });
  });

  it('omits the plan fields when incomplete', () => {
    const request = assembler.toRequestFromDraft(
      new VehicleOfferDraft({
        make: 'Honda',
        model: 'Accord',
        year: 2022,
        salePrice: 30000,
        currency: Currency.USD,
        planName: null,
        planInstallments: null,
      }),
    );
    expect(request.planName).toBeUndefined();
    expect(request.planInstallments).toBeUndefined();
  });

  it('maps a response (nested money + plan) to the entity', () => {
    const entity = assembler.toEntityFromResource({
      id: 'o-1',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      salePrice: {amount: 30000, currency: 'USD'},
      planName: 'Plan 48',
      planInstallments: 48,
    });
    expect(entity.id).toBe('o-1');
    expect(entity.salePrice.amount).toBe(30000);
    expect(entity.salePrice.currency).toBe('USD');
    expect(entity.plan?.name).toBe('Plan 48');
    expect(entity.plan?.installments).toBe(48);
  });

  it('maps a response without a plan to a null plan', () => {
    const entity = assembler.toEntityFromResource({
      id: 'o-2',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      salePrice: {amount: 25000, currency: 'PEN'},
      planName: null,
      planInstallments: null,
    });
    expect(entity.plan).toBeNull();
  });

  it('maps a list of resources', () => {
    const entities = assembler.toEntitiesFromResource([
      {
        id: 'o-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: {amount: 25000, currency: 'PEN'},
        planName: null,
        planInstallments: null,
      },
    ]);
    expect(entities).toHaveLength(1);
    expect(entities[0].make).toBe('Toyota');
  });
});
