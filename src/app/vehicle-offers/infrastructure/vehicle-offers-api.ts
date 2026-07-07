import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOffersApiEndpoint} from './vehicle-offers-api-endpoint';

/**
 * Facade for the Vehicle Offers REST endpoints. The application store talks only
 * to this.
 */
@Service()
export class VehicleOffersApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = new VehicleOffersApiEndpoint(this.http);

  getAll(): Observable<VehicleOffer[]> {
    return this.endpoint.getAll();
  }

  getById(id: string): Observable<VehicleOffer> {
    return this.endpoint.getById(id);
  }

  create(draft: VehicleOfferDraft): Observable<VehicleOffer> {
    return this.endpoint.create(draft);
  }

  update(id: string, draft: VehicleOfferDraft): Observable<VehicleOffer> {
    return this.endpoint.update(id, draft);
  }
}
