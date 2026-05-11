import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { InventarioService } from '../../services/inventario.service';
import { InventarioPage } from './inventario.page';

describe('InventarioPage', () => {
  const usuario = {
    id: 7,
    nombre: 'Daniel',
    email: 'daniel@email.com',
    rol: 'USER' as const,
    ultimaConexion: null,
  };

  const plantas = [
    {
      id: 3,
      nombre: 'Monstera',
      descripcion: 'Interior',
      tipo: { id: 1, valor: 'Interior' },
      familia: { id: 2, valor: 'Araceae' },
      mantenimiento: { id: 3, valor: 'MEDIO' },
      salud: { id: 4, valor: 'Sana' },
    },
  ];

  const inventario = [
    {
      id: 11,
      usuarioId: 7,
      plantaId: 3,
      nombrePlanta: 'Monstera',
      nombrePersonalizado: 'Sala',
      fechaAgregado: '2026-05-04',
    },
  ];

  let authService: Pick<AuthService, 'getCurrentUser'>;
  let apiService: Pick<ApiService, 'getPlantas'>;
  let inventarioService: Pick<InventarioService, 'getInventarioPorUsuario' | 'agregarPlanta'>;

  beforeEach(async () => {
    authService = {
      getCurrentUser: vi.fn(() => usuario),
    };
    apiService = {
      getPlantas: vi.fn(() => of(plantas)),
    };
    inventarioService = {
      getInventarioPorUsuario: vi.fn(() => of(inventario)),
      agregarPlanta: vi.fn(() => of(inventario[0])),
    };

    await TestBed.configureTestingModule({
      imports: [InventarioPage],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ApiService, useValue: apiService },
        { provide: InventarioService, useValue: inventarioService },
      ],
    }).compileComponents();
  });

  it('carga catalogo e inventario reales del usuario', () => {
    const fixture = TestBed.createComponent(InventarioPage);

    fixture.detectChanges();

    expect(apiService.getPlantas).toHaveBeenCalled();
    expect(inventarioService.getInventarioPorUsuario).toHaveBeenCalledWith(7);
    expect(fixture.nativeElement.textContent).toContain('Sala');
    expect(fixture.nativeElement.textContent).toContain('Monstera');
  });

  it('agrega una planta real y recarga el inventario', () => {
    const fixture = TestBed.createComponent(InventarioPage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.form.controls.plantaId.setValue('3');
    component.form.controls.nombrePersonalizado.setValue('Sala');
    component.agregarPlanta();

    expect(inventarioService.agregarPlanta).toHaveBeenCalledWith(7, {
      plantaId: 3,
      nombrePersonalizado: 'Sala',
    });
    expect(inventarioService.getInventarioPorUsuario).toHaveBeenCalledTimes(2);
  });
});
