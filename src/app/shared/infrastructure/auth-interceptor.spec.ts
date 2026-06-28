import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {TokenStorage} from '../../iam/infrastructure/token-storage';
import {authInterceptor} from './auth-interceptor';

const base = environment.platformProviderApiBaseUrl;
const signInUrl = `${base}${environment.platformProviderSignInEndpointPath}`;
const dealershipsUrl = `${base}${environment.platformProviderDealershipsEndpointPath}`;
const protectedUrl = `${base}${environment.platformProviderClientsEndpointPath}`;

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenStorage: {getToken: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    tokenStorage = {getToken: vi.fn().mockReturnValue('jwt-abc')};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {provide: TokenStorage, useValue: tokenStorage},
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds a Bearer header to a protected API request when a token is stored', () => {
    http.get(protectedUrl).subscribe();
    const req = httpMock.expectOne(protectedUrl);
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({});
  });

  it('does not add a Bearer header to the sign-in request', () => {
    http.post(signInUrl, {}).subscribe();
    const req = httpMock.expectOne(signInUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add a Bearer header to dealership registration (POST /dealerships)', () => {
    http.post(dealershipsUrl, {}).subscribe();
    const req = httpMock.expectOne(dealershipsUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add a Bearer header when no token is stored', () => {
    tokenStorage.getToken.mockReturnValue(null);
    http.get(protectedUrl).subscribe();
    const req = httpMock.expectOne(protectedUrl);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
