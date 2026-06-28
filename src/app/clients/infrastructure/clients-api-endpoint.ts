import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {Client} from '../domain/model/client.entity';
import {ClientDraft} from '../domain/model/client-draft.command';
import {ClientAssembler} from './client-assembler';
import {ClientResource} from './client-response';

/**
 * Endpoint for `/clients`. A dedicated endpoint (not the generic `BaseApiEndpoint`)
 * because create and update use asymmetric request bodies — register carries the
 * document, update only the contact data (the document is immutable). No DELETE
 * (the backend exposes none). HTTP errors propagate to the global interceptor.
 */
export class ClientsApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderClientsEndpointPath}`;
  private readonly assembler = new ClientAssembler();

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Client[]> {
    return this.http
      .get<ClientResource[]>(this.endpointUrl)
      .pipe(map(resources => this.assembler.toEntitiesFromResource(resources)));
  }

  getById(id: string): Observable<Client> {
    return this.http
      .get<ClientResource>(`${this.endpointUrl}/${id}`)
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  create(draft: ClientDraft): Observable<Client> {
    return this.http
      .post<ClientResource>(this.endpointUrl, this.assembler.toRegisterRequest(draft))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }

  update(id: string, draft: ClientDraft): Observable<Client> {
    return this.http
      .put<ClientResource>(`${this.endpointUrl}/${id}`, this.assembler.toUpdateRequest(draft))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
