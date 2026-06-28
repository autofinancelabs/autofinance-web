import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {CreditSimulation} from '../domain/model/credit-simulation.entity';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {CreditSimulationsApiEndpoint} from './credit-simulations-api-endpoint';

/**
 * Facade for the Credit Simulation REST endpoints. The application store talks
 * only to this.
 */
@Service()
export class CreditSimulationsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = new CreditSimulationsApiEndpoint(this.http);

  generate(draft: SimulationDraft): Observable<CreditSimulation> {
    return this.endpoint.generate(draft);
  }

  getById(id: string): Observable<CreditSimulation> {
    return this.endpoint.getById(id);
  }

  listByClient(clientId: string): Observable<CreditSimulation[]> {
    return this.endpoint.listByClient(clientId);
  }
}
