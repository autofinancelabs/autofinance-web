import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {RegisterVehicleOfferResource, VehicleOfferResource} from './vehicle-offer-response';

/**
 * Anti-corruption layer for vehicle offers: maps the draft command to the flat
 * request body, and the nested response back to the domain entity (with `Money`).
 */
export class VehicleOfferAssembler {
  toRequestFromDraft(draft: VehicleOfferDraft): RegisterVehicleOfferResource {
    return {
      make: draft.make,
      model: draft.model,
      year: draft.year,
      salePrice: draft.salePrice,
      currency: draft.currency,
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
    });
  }

  toEntitiesFromResource(resources: VehicleOfferResource[]): VehicleOffer[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}
