import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {CreditSimulation} from '../domain/model/credit-simulation.entity';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {SimulationAssembler} from './simulation-assembler';
import {SimulationResource} from './simulation-response';

/**
 * Endpoint for `/credit-simulations`. The backend computes the schedule and
 * indicators; this just sends the configuration and maps the response. The
 * by-client list is a `clientId` query param. HTTP errors propagate to the global
 * error interceptor.
 */
export class CreditSimulationsApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderCreditSimulationsEndpointPath}`;
  private readonly assembler = new SimulationAssembler();

  constructor(private readonly http: HttpClient) {}

  generate(draft: SimulationDraft): Observable<CreditSimulation> {
    return this.http
      .post<SimulationResource>(this.endpointUrl, this.assembler.toGenerateRequest(draft))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  getById(id: string): Observable<CreditSimulation> {
    return this.http
      .get<SimulationResource>(`${this.endpointUrl}/${id}`)
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  listByClient(clientId: string): Observable<CreditSimulation[]> {
    const params = new HttpParams().set('clientId', clientId);
    return this.http
      .get<SimulationResource[]>(this.endpointUrl, {params})
      .pipe(map(resources => this.assembler.toEntitiesFromResource(resources)));
  }

  /** All simulations of the current dealership (tenant-scoped server-side). */
  listAll(): Observable<CreditSimulation[]> {
    return this.http
      .get<SimulationResource[]>(this.endpointUrl)
      .pipe(map(resources => this.assembler.toEntitiesFromResource(resources)));
  }
}
