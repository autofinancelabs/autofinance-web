import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {VehicleOffer} from '../domain/model/vehicle-offer.entity';
import {VehicleOfferDraft} from '../domain/model/vehicle-offer-draft.command';
import {VehicleOfferAssembler} from './vehicle-offer-assembler';
import {VehicleOfferResource} from './vehicle-offer-response';

/**
 * Endpoint for `/vehicle-offers`. A dedicated endpoint (not the generic
 * `BaseApiEndpoint`) because the request shape (flat `salePrice`) is asymmetric
 * with the response (nested `salePrice`). No DELETE (the backend returns 405).
 * HTTP errors propagate to the global error interceptor.
 */
export class VehicleOffersApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderVehicleOffersEndpointPath}`;
  private readonly assembler = new VehicleOfferAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<VehicleOffer[]> {
    return this.http
      .get<VehicleOfferResource[]>(this.endpointUrl)
      .pipe(map(resources => this.assembler.toEntitiesFromResource(resources)));
  }

  getById(id: string): Observable<VehicleOffer> {
    return this.http
      .get<VehicleOfferResource>(`${this.endpointUrl}/${id}`)
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  create(draft: VehicleOfferDraft): Observable<VehicleOffer> {
    return this.http
      .post<VehicleOfferResource>(this.endpointUrl, this.assembler.toRequestFromDraft(draft))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  update(id: string, draft: VehicleOfferDraft): Observable<VehicleOffer> {
    return this.http
      .put<VehicleOfferResource>(`${this.endpointUrl}/${id}`, this.assembler.toRequestFromDraft(draft))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
