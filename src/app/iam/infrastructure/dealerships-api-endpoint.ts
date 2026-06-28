import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Dealership} from '../domain/model/dealership.entity';
import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {DealershipAssembler} from './dealership-assembler';
import {DealershipResource} from './dealership-response';

/**
 * Endpoint for `POST /dealerships` (dealership registration). A single non-CRUD
 * POST; HTTP errors propagate to the global error interceptor.
 */
export class DealershipsApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderDealershipsEndpointPath}`;
  private readonly assembler = new DealershipAssembler();

  constructor(private readonly http: HttpClient) {}

  register(registration: DealershipRegistration): Observable<Dealership> {
    return this.http
      .post<DealershipResource>(this.endpointUrl, this.assembler.toRequestFromCommand(registration))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
