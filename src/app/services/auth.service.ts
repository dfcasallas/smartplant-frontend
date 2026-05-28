import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, UsuarioResponse } from '../models/smartplants.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';
  private readonly userStorageKey = 'smartplant_user';
  private readonly tokenStorageKey = 'smartplant_token';
  private readonly currentUserSignal = signal<UsuarioResponse | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  register(request: RegisterRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.removeStoredSession();
  }

  getCurrentUser(): UsuarioResponse | null {
    return this.currentUserSignal();
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null && this.getToken() !== null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.currentUserSignal()?.rol === 'ADMIN';
  }

  getToken(): string | null {
    try {
      return globalThis.localStorage?.getItem(this.tokenStorageKey) || null;
    } catch {
      return null;
    }
  }

  private saveSession(response: LoginResponse): void {
    const usuario = this.toUsuarioResponse(response);
    this.currentUserSignal.set(usuario);
    try {
      globalThis.localStorage?.setItem(this.userStorageKey, JSON.stringify(usuario));
      globalThis.localStorage?.setItem(this.tokenStorageKey, response.token);
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }

  private toUsuarioResponse(response: LoginResponse): UsuarioResponse {
    return {
      id: response.id,
      nombre: response.nombre,
      email: response.email,
      rol: response.rol,
      ultimaConexion: response.ultimaConexion,
    };
  }

  private readStoredUser(): UsuarioResponse | null {
    try {
      if (!this.getToken()) {
        return null;
      }

      const raw = globalThis.localStorage?.getItem(this.userStorageKey);
      return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
    } catch {
      return null;
    }
  }

  private removeStoredSession(): void {
    try {
      globalThis.localStorage?.removeItem(this.userStorageKey);
      globalThis.localStorage?.removeItem(this.tokenStorageKey);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }
}
