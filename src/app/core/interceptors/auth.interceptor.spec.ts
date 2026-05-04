import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let http: HttpTestingController;
  let auth: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      getToken: vi.fn(),
      logout: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('agrega Authorization Bearer a requests hacia /api si hay token', () => {
    auth.getToken.mockReturnValue('jwt-token');

    httpClient.get('/api/plantas').subscribe();

    const request = http.expectOne('/api/plantas');
    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush([]);
  });

  it('no agrega Authorization si no hay token', () => {
    auth.getToken.mockReturnValue(null);

    httpClient.get('/api/plantas').subscribe();

    const request = http.expectOne('/api/plantas');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('limpia sesion y redirige a login cuando backend responde 401', () => {
    auth.getToken.mockReturnValue('jwt-token');

    httpClient.get('/api/plantas').subscribe({
      error: () => undefined,
    });

    const request = http.expectOne('/api/plantas');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
