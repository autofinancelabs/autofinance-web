import {Currency} from '../../shared/domain/model/currency';
import {Model3dPreset} from '../domain/model/model-3d-preset';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOfferAssembler} from './vehicle-offer-assembler';

describe('VehicleOfferAssembler', () => {
  const assembler = new VehicleOfferAssembler();

  it('maps a draft to a flat request (no 3D model)', () => {
    const request = assembler.toRequestFromDraft(
      new VehicleOfferDraft({
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: 25000,
        currency: Currency.PEN,
        model3d: null,
      }),
    );
    expect(request).toEqual({
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      salePrice: 25000,
      currency: 'PEN',
      model3d: null,
    });
  });

  it('passes the 3D model through on the request', () => {
    const model3d = {
      preset: Model3dPreset.COUPE,
      bodyColor: '#d93a54',
      windowColor: '#1b2b33',
      sportWheels: true,
      spoiler: true,
      panoRoof: false,
      plateText: 'ABC-123',
    };
    const request = assembler.toRequestFromDraft(
      new VehicleOfferDraft({
        make: 'Toyota',
        model: 'GR86',
        year: 2024,
        salePrice: 40000,
        currency: Currency.USD,
        model3d,
      }),
    );
    expect(request.model3d).toEqual(model3d);
  });

  it('maps a response (nested money) to the entity', () => {
    const entity = assembler.toEntityFromResource({
      id: 'o-1',
      make: 'Honda',
      model: 'Accord',
      year: 2022,
      salePrice: {amount: 30000, currency: 'USD'},
      model3d: null,
    });
    expect(entity.id).toBe('o-1');
    expect(entity.salePrice.amount).toBe(30000);
    expect(entity.salePrice.currency).toBe('USD');
    expect(entity.model3d).toBeNull();
  });

  it('maps a nested 3D model, defaulting missing options', () => {
    const entity = assembler.toEntityFromResource({
      id: 'o-2',
      make: 'Honda',
      model: 'CB500',
      year: 2025,
      salePrice: {amount: 21000, currency: 'USD'},
      model3d: {
        preset: 'MOTORCYCLE',
        bodyColor: '#16b1b1',
        windowColor: null,
        sportWheels: null,
        spoiler: null,
        panoRoof: null,
        plateText: null,
      },
    });
    expect(entity.model3d?.preset).toBe(Model3dPreset.MOTORCYCLE);
    expect(entity.model3d?.bodyColor).toBe('#16b1b1');
    expect(entity.model3d?.sportWheels).toBe(false);
    expect(entity.model3d?.plateText).toBe('');
    expect(entity.model3d?.windowColor).toBeTruthy();
  });

  it('maps a list of resources', () => {
    const entities = assembler.toEntitiesFromResource([
      {
        id: 'o-1',
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        salePrice: {amount: 25000, currency: 'PEN'},
        model3d: null,
      },
    ]);
    expect(entities).toHaveLength(1);
    expect(entities[0].make).toBe('Toyota');
  });
});
