import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });

    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('guarda usuario y token al iniciar sesion', () => {
    service.login({ email: 'daniel@email.com', password: '123456' }).subscribe();

    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 1,
      nombre: 'Daniel',
      email: 'daniel@email.com',
      rol: 'USER',
      ultimaConexion: '2026-05-04T11:00:00',
      token: 'jwt-token',
    });

    expect(service.getToken()).toBe('jwt-token');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getCurrentUser()?.email).toBe('daniel@email.com');
    expect(JSON.parse(localStorage.getItem('smartplant_user') || '{}').token).toBeUndefined();
  });

  it('logout limpia usuario y token', () => {
    localStorage.setItem('smartplant_user', JSON.stringify({ id: 1, nombre: 'Daniel', email: 'daniel@email.com', rol: 'USER' }));
    localStorage.setItem('smartplant_token', 'jwt-token');

    service.logout();

    expect(service.getCurrentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('ignora sesiones antiguas sin token', () => {
    TestBed.resetTestingModule();
    localStorage.setItem('smartplant_user', JSON.stringify({ id: 1, nombre: 'Daniel', email: 'daniel@email.com', rol: 'USER' }));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });

    const freshService = TestBed.inject(AuthService);
    const freshHttp = TestBed.inject(HttpTestingController);

    expect(freshService.getCurrentUser()).toBeNull();
    expect(freshService.isAuthenticated()).toBe(false);

    freshHttp.verify();
  });
});
