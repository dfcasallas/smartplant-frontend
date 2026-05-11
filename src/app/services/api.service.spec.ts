import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService],
    });

    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('lista plantas desde el endpoint real', () => {
    service.getPlantas().subscribe();

    const request = http.expectOne('/api/plantas');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('consulta sugerencias con el endpoint real', () => {
    const payload = {
      mantenimiento: 'BAJO',
      luz: 2,
      riego: 2,
      temperatura: 2,
      tamano: 2,
      ambiente: 2,
    };

    service.sugerirPlanta(payload).subscribe();

    const request = http.expectOne('/api/sugerencias');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({
      plantaId: 3,
      nombre: 'Cactus',
      descripcion: 'Bajo mantenimiento',
      mantenimiento: 'BAJO',
      puntaje: 5,
    });
  });
});
