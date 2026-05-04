import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CuidadosService } from './cuidados.service';
import { InventarioService } from './inventario.service';

describe('InventarioService y CuidadosService', () => {
  let http: HttpTestingController;
  let inventarioService: InventarioService;
  let cuidadosService: CuidadosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), InventarioService, CuidadosService],
    });

    http = TestBed.inject(HttpTestingController);
    inventarioService = TestBed.inject(InventarioService);
    cuidadosService = TestBed.inject(CuidadosService);
  });

  afterEach(() => {
    http.verify();
  });

  it('consume el inventario del usuario con el endpoint real', () => {
    inventarioService.getInventarioPorUsuario(7).subscribe();

    const request = http.expectOne('/api/usuarios/7/inventario');
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('consume detalle de inventario con el endpoint real', () => {
    inventarioService.getInventarioPorId(11).subscribe();

    const request = http.expectOne('/api/inventario/11');
    expect(request.request.method).toBe('GET');
    request.flush({
      id: 11,
      usuarioId: 7,
      plantaId: 3,
      nombrePlanta: 'Monstera',
      nombrePersonalizado: 'Sala',
      fechaAgregado: '2026-05-04',
    });
  });

  it('registra y lista cuidados con endpoints reales', () => {
    cuidadosService.registrar(11, { tipoCuidado: 'RIEGO', observacion: 'Tierra seca' }).subscribe();

    const postRequest = http.expectOne('/api/inventario/11/cuidados');
    expect(postRequest.request.method).toBe('POST');
    expect(postRequest.request.body).toEqual({ tipoCuidado: 'RIEGO', observacion: 'Tierra seca' });
    postRequest.flush({
      id: 21,
      inventarioId: 11,
      tipoCuidado: 'RIEGO',
      fecha: '2026-05-04',
      observacion: 'Tierra seca',
      proximaFechaSugerida: '2026-05-09',
    });

    cuidadosService.listarPorInventario(11).subscribe();

    const getRequest = http.expectOne('/api/inventario/11/cuidados');
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush([]);
  });
});
