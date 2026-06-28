import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {AuthenticatedUser} from '../domain/model/authenticated-user.entity';
import {Credentials} from '../domain/model/credentials.command';
import {AuthenticatedUserAssembler} from './authenticated-user-assembler';
import {AuthenticatedUserResource} from './authenticated-user-response';

/**
 * Endpoint for `POST /authentication/sign-in`. A single non-CRUD POST, so it does
 * not extend the generic `BaseApiEndpoint`. HTTP errors propagate to the global
 * error interceptor (which converts them to `ApiError`).
 */
export class SignInApiEndpoint {
  private readonly endpointUrl =
    `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignInEndpointPath}`;
  private readonly assembler = new AuthenticatedUserAssembler();

  constructor(private readonly http: HttpClient) {}

  signIn(credentials: Credentials): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUserResource>(this.endpointUrl, this.assembler.toRequestFromCommand(credentials))
      .pipe(map(resource => this.assembler.toEntityFromResource(resource)));
  }
}
