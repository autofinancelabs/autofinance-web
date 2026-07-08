import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {Model3dPreset} from '../domain/model/model-3d-preset';
import {Vehicle3dModel} from '../domain/model/vehicle-3d-model';
import {DEFAULT_WINDOW_COLOR} from '../domain/model/vehicle-3d-palette';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {
  Model3dResource,
  RegisterVehicleOfferResource,
  VehicleOfferResource,
} from './vehicle-offer-response';

/**
 * Anti-corruption layer for vehicle offers: maps the draft command to the flat
 * request body, and the nested response back to the domain entity (with `Money`).
 * The optional 3D model is a nested object; on the way in we fill nullable options
 * (older rows may lack them) with sensible defaults.
 */
export class VehicleOfferAssembler {
  toRequestFromDraft(draft: VehicleOfferDraft): RegisterVehicleOfferResource {
    return {
      make: draft.make,
      model: draft.model,
      year: draft.year,
      salePrice: draft.salePrice,
      currency: draft.currency,
      model3d: draft.model3d,
    };
  }

  toEntityFromResource(resource: VehicleOfferResource): VehicleOffer {
    return new VehicleOffer({
      id: resource.id,
      make: resource.make,
      model: resource.model,
      year: resource.year,
      salePrice: new Money({
        amount: resource.salePrice.amount,
        currency: resource.salePrice.currency as Currency,
      }),
      model3d: this.toModel3d(resource.model3d),
    });
  }

  toEntitiesFromResource(resources: VehicleOfferResource[]): VehicleOffer[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  private toModel3d(resource: Model3dResource | null): Vehicle3dModel | null {
    if (resource === null) {
      return null;
    }
    return {
      preset: resource.preset as Model3dPreset,
      bodyColor: resource.bodyColor,
      windowColor: resource.windowColor ?? DEFAULT_WINDOW_COLOR,
      sportWheels: resource.sportWheels ?? false,
      spoiler: resource.spoiler ?? false,
      panoRoof: resource.panoRoof ?? false,
      plateText: resource.plateText ?? '',
    };
  }
}
