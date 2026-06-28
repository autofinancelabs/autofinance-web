import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {TokenStorage} from '../../iam/infrastructure/token-storage';
import {ApiError} from './api-error';
import {errorInterceptor} from './error-interceptor';
import {NotificationService} from './notification.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenStorage: {clear: ReturnType<typeof vi.fn>};
  let router: {navigate: ReturnType<typeof vi.fn>};
  let notification: {error: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    tokenStorage = {clear: vi.fn()};
    router = {navigate: vi.fn()};
    notification = {error: vi.fn()};
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        {provide: TokenStorage, useValue: tokenStorage},
        {provide: Router, useValue: router},
        {provide: NotificationService, useValue: notification},
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('converts a 401 UNAUTHENTICATED into an ApiError, clears the token and redirects', () => {
    let caught: ApiError | undefined;
    http.get('/api/protected').subscribe({error: (e: ApiError) => (caught = e)});

    httpMock.expectOne('/api/protected').flush(
      {status: 401, code: 'UNAUTHENTICATED', detail: 'Missing or invalid token'},
      {status: 401, statusText: 'Unauthorized'},
    );

    expect(caught).toBeInstanceOf(ApiError);
    expect(caught?.code).toBe('UNAUTHENTICATED');
    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
    expect(notification.error).toHaveBeenCalledTimes(1);
  });

  it('does NOT clear, redirect or toast on a 401 INVALID_CREDENTIALS (failed login)', () => {
    let caught: ApiError | undefined;
    http.post('/api/sign-in', {}).subscribe({error: (e: ApiError) => (caught = e)});

    httpMock.expectOne('/api/sign-in').flush(
      {status: 401, code: 'INVALID_CREDENTIALS'},
      {status: 401, statusText: 'Unauthorized'},
    );

    expect(caught?.code).toBe('INVALID_CREDENTIALS');
    expect(tokenStorage.clear).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('populates fieldErrors on a 400 VALIDATION_FAILED without toasting', () => {
    let caught: ApiError | undefined;
    http.post('/api/dealerships', {}).subscribe({error: (e: ApiError) => (caught = e)});

    httpMock.expectOne('/api/dealerships').flush(
      {
        status: 400,
        code: 'VALIDATION_FAILED',
        errors: [{field: 'ruc', message: 'must be 11 digits'}],
      },
      {status: 400, statusText: 'Bad Request'},
    );

    expect(caught?.code).toBe('VALIDATION_FAILED');
    expect(caught?.fieldErrors).toEqual([{field: 'ruc', message: 'must be 11 digits'}]);
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('toasts an operational error (500) and rethrows it', () => {
    let caught: ApiError | undefined;
    http.get('/api/vehicle-offers').subscribe({error: (e: ApiError) => (caught = e)});

    httpMock.expectOne('/api/vehicle-offers').flush(
      {status: 500, code: 'INTERNAL_ERROR', detail: 'boom'},
      {status: 500, statusText: 'Internal Server Error'},
    );

    expect(caught?.status).toBe(500);
    expect(notification.error).toHaveBeenCalledTimes(1);
  });

  it('toasts a network failure (status 0)', () => {
    let caught: ApiError | undefined;
    http.get('/api/vehicle-offers').subscribe({error: (e: ApiError) => (caught = e)});

    httpMock.expectOne('/api/vehicle-offers').error(new ProgressEvent('network'));

    expect(caught?.status).toBe(0);
    expect(notification.error).toHaveBeenCalledTimes(1);
  });
});
