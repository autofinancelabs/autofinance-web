import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Client} from '../domain/model/client.entity';
import {ClientDraft} from '../domain/model/client-draft.command';
import {ClientsApiEndpoint} from './clients-api-endpoint';

/**
 * Facade for the Clients REST endpoints. The application store talks only to this.
 */
@Service()
export class ClientsApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly endpoint = new ClientsApiEndpoint(this.http);

  getAll(): Observable<Client[]> {
    return this.endpoint.getAll();
  }

  getById(id: string): Observable<Client> {
    return this.endpoint.getById(id);
  }

  create(draft: ClientDraft): Observable<Client> {
    return this.endpoint.create(draft);
  }

  update(id: string, draft: ClientDraft): Observable<Client> {
    return this.endpoint.update(id, draft);
  }
}
