import {HttpClient} from '@angular/common/http';
import {inject, Service} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {AuthenticatedUser} from '../domain/model/authenticated-user.entity';
import {Credentials} from '../domain/model/credentials.command';
import {Dealership} from '../domain/model/dealership.entity';
import {DealershipRegistration} from '../domain/model/dealership-registration.command';
import {DealershipsApiEndpoint} from './dealerships-api-endpoint';
import {SignInApiEndpoint} from './sign-in-api-endpoint';

/**
 * Facade for the IAM bounded context's REST endpoints. Composes the sign-in and
 * dealerships endpoints; the application layer (`AuthStore`) talks only to this.
 */
@Service()
export class IamApi extends BaseApi {
  private readonly http = inject(HttpClient);
  private readonly signInEndpoint = new SignInApiEndpoint(this.http);
  private readonly dealershipsEndpoint = new DealershipsApiEndpoint(this.http);

  signIn(credentials: Credentials): Observable<AuthenticatedUser> {
    return this.signInEndpoint.signIn(credentials);
  }

  register(registration: DealershipRegistration): Observable<Dealership> {
    return this.dealershipsEndpoint.register(registration);
  }
}
