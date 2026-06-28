import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {Plan} from '../domain/model/plan.value-object';
import {RegisterVehicleOfferResource, VehicleOfferResource} from './vehicle-offer-response';

/**
 * Anti-corruption layer for vehicle offers: maps the draft command to the flat
 * request body, and the nested response back to the domain entity (with `Money`
 * and an optional `Plan`).
 */
export class VehicleOfferAssembler {
  toRequestFromDraft(draft: VehicleOfferDraft): RegisterVehicleOfferResource {
    const resource: RegisterVehicleOfferResource = {
      make: draft.make,
      model: draft.model,
      year: draft.year,
      salePrice: draft.salePrice,
      currency: draft.currency,
    };
    // Plan is all-or-nothing: include both fields only when both are present.
    if (draft.planName !== null && draft.planInstallments !== null) {
      resource.planName = draft.planName;
      resource.planInstallments = draft.planInstallments;
    }
    return resource;
  }

  toEntityFromResource(resource: VehicleOfferResource): VehicleOffer {
    const plan =
      resource.planName !== null && resource.planInstallments !== null
        ? new Plan({name: resource.planName, installments: resource.planInstallments})
        : null;
    return new VehicleOffer({
      id: resource.id,
      make: resource.make,
      model: resource.model,
      year: resource.year,
      salePrice: new Money({
        amount: resource.salePrice.amount,
        currency: resource.salePrice.currency as Currency,
      }),
      plan,
    });
  }

  toEntitiesFromResource(resources: VehicleOfferResource[]): VehicleOffer[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }
}
