import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CuidadosPage } from './cuidados.page';
import { AuthService } from '../../services/auth.service';
import { CuidadosService } from '../../services/cuidados.service';
import { InventarioService } from '../../services/inventario.service';

describe('CuidadosPage', () => {
  const usuario = {
    id: 7,
    nombre: 'Daniel',
    email: 'daniel@email.com',
    rol: 'USER' as const,
    ultimaConexion: null,
  };

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

  const cuidado = {
    id: 21,
    inventarioId: 11,
    tipoCuidado: 'RIEGO' as const,
    fecha: '2026-05-04',
    observacion: 'Tierra seca',
    proximaFechaSugerida: '2026-05-09',
  };

  let authService: Pick<AuthService, 'getCurrentUser'>;
  let inventarioService: Pick<InventarioService, 'getInventarioPorUsuario'>;
  let cuidadosService: Pick<CuidadosService, 'listarPorInventario' | 'registrar'>;

  beforeEach(async () => {
    authService = {
      getCurrentUser: vi.fn(() => usuario),
    };
    inventarioService = {
      getInventarioPorUsuario: vi.fn(() => of(inventario)),
    };
    cuidadosService = {
      listarPorInventario: vi.fn(() => of([cuidado])),
      registrar: vi.fn(() => of(cuidado)),
    };

    await TestBed.configureTestingModule({
      imports: [CuidadosPage],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: InventarioService, useValue: inventarioService },
        { provide: CuidadosService, useValue: cuidadosService },
      ],
    }).compileComponents();
  });

  it('carga inventario real del usuario y muestra la timeline recibida', () => {
    const fixture = TestBed.createComponent(CuidadosPage);

    fixture.detectChanges();

    expect(inventarioService.getInventarioPorUsuario).toHaveBeenCalledWith(7);
    expect(cuidadosService.listarPorInventario).toHaveBeenCalledWith(11);
    expect(fixture.nativeElement.textContent).toContain('Sala (Monstera)');
    expect(fixture.nativeElement.textContent).toContain('RIEGO');
    expect(fixture.nativeElement.textContent).toContain('Tierra seca');
    expect(fixture.nativeElement.textContent).toContain('Proxima fecha sugerida');
  });

  it('registra un cuidado real y recarga la timeline', () => {
    const fixture = TestBed.createComponent(CuidadosPage);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.form.controls.tipoCuidado.setValue('ABONO');
    component.form.controls.observacion.setValue('Abono organico');
    component.guardarCuidado();

    expect(cuidadosService.registrar).toHaveBeenCalledWith(11, {
      tipoCuidado: 'ABONO',
      observacion: 'Abono organico',
    });
    expect(cuidadosService.listarPorInventario).toHaveBeenCalledTimes(2);
    expect(cuidadosService.listarPorInventario).toHaveBeenLastCalledWith(11);
  });
});
