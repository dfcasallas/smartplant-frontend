import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { SugerenciasPage } from './sugerencias.page';

describe('SugerenciasPage', () => {
  let apiService: Pick<ApiService, 'getMantenimientos' | 'sugerirPlanta'>;

  beforeEach(async () => {
    apiService = {
      getMantenimientos: vi.fn(() => of([{ id: 1, valor: 'BAJO' }])),
      sugerirPlanta: vi.fn(() => of({
        plantaId: 3,
        nombre: 'Cactus',
        descripcion: 'Bajo mantenimiento',
        mantenimiento: 'BAJO',
        puntaje: 5,
      })),
    };

    await TestBed.configureTestingModule({
      imports: [SugerenciasPage],
      providers: [{ provide: ApiService, useValue: apiService }],
    }).compileComponents();
  });

  it('carga catalogo de mantenimientos y consulta sugerencias reales', () => {
    const fixture = TestBed.createComponent(SugerenciasPage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.buscarSugerencia();
    fixture.detectChanges();

    expect(apiService.getMantenimientos).toHaveBeenCalled();
    expect(apiService.sugerirPlanta).toHaveBeenCalledWith({
      mantenimiento: 'BAJO',
      luz: 2,
      riego: 2,
      temperatura: 2,
      tamano: 2,
      ambiente: 2,
    });
    expect(fixture.nativeElement.textContent).toContain('Cactus');
    expect(fixture.nativeElement.textContent).toContain('Match 5/5');
  });
});
