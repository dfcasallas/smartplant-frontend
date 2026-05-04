import { CanActivateFn, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { authGuard, guestGuard, rootRedirectGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('auth guards', () => {
  let auth: { isAuthenticated: ReturnType<typeof vi.fn> };
  let router: { navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      isAuthenticated: vi.fn(),
    };
    router = {
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('permite rutas privadas con sesion activa', () => {
    auth.isAuthenticated.mockReturnValue(true);

    const result = runGuard(authGuard);

    expect(result).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('bloquea rutas privadas y redirige a login sin sesion', () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = runGuard(authGuard);

    expect(result).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('redirige login y register a inicio si ya hay sesion', () => {
    auth.isAuthenticated.mockReturnValue(true);

    const result = runGuard(guestGuard);

    expect(result).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/inicio');
  });

  it('redirige la ruta raiz segun la sesion actual', () => {
    auth.isAuthenticated.mockReturnValue(false);

    const result = runGuard(rootRedirectGuard);

    expect(result).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');

    router.navigateByUrl.mockClear();
    auth.isAuthenticated.mockReturnValue(true);

    const authenticatedResult = runGuard(rootRedirectGuard);

    expect(authenticatedResult).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/inicio');
  });

  function runGuard(guard: CanActivateFn): ReturnType<CanActivateFn> {
    return TestBed.runInInjectionContext(() => guard({} as never, {} as never));
  }
});
