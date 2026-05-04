import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, UsuarioResponse } from '../models/smartplants.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';
  private readonly storageKey = 'smartplant_user';
  private readonly currentUserSignal = signal<UsuarioResponse | null>(this.readStoredUser());

  readonly currentUser = this.currentUserSignal.asReadonly();

  register(request: RegisterRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.baseUrl}/login`, request).pipe(
      tap((usuario) => this.saveCurrentUser(usuario)),
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.removeStoredUser();
  }

  getCurrentUser(): UsuarioResponse | null {
    return this.currentUserSignal();
  }

  isAuthenticated(): boolean {
    return this.currentUserSignal() !== null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  private saveCurrentUser(usuario: UsuarioResponse): void {
    this.currentUserSignal.set(usuario);
    try {
      globalThis.localStorage?.setItem(this.storageKey, JSON.stringify(usuario));
    } catch {
      // localStorage can be unavailable in restricted browser contexts.
    }
  }

  private readStoredUser(): UsuarioResponse | null {
    try {
      const raw = globalThis.localStorage?.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as UsuarioResponse) : null;
    } catch {
      return null;
    }
  }

  private removeStoredUser(): void {
    try {
      globalThis.localStorage?.removeItem(this.storageKey);
    } catch {
      // Nothing to clear when storage is unavailable.
    }
  }
}
