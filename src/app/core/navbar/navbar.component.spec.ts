import { signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../services/auth.service';
import { UsuarioResponse } from '../../models/smartplants.models';

describe('NavbarComponent', () => {
  const user: UsuarioResponse = {
    id: 1,
    nombre: 'Daniel',
    email: 'daniel@email.com',
    rol: 'USER',
    ultimaConexion: null,
  };

  let currentUser: ReturnType<typeof signal<UsuarioResponse | null>>;
  let auth: { currentUser: () => UsuarioResponse | null; logout: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    currentUser = signal<UsuarioResponse | null>(null);
    auth = {
      currentUser: currentUser.asReadonly(),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('oculta el menu principal cuando no hay sesion', () => {
    const fixture = TestBed.createComponent(NavbarComponent);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).not.toContain('Plantas');
    expect(text).not.toContain('Dudas IA');
    expect(text).toContain('Login');
    expect(text).toContain('Register');
  });

  it('muestra el menu completo y permite cerrar sesion con usuario autenticado', () => {
    currentUser.set(user);
    const fixture = TestBed.createComponent(NavbarComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Plantas');
    expect(text).toContain('Sugerencias');
    expect(text).toContain('Dudas IA');
    expect(text).toContain('Inventario');
    expect(text).toContain('Cuidados');
    expect(text).toContain('Admin');

    fixture.componentInstance.logout();

    expect(auth.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/login');
  });
});
