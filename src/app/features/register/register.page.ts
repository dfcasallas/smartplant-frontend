import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Rol } from '../../models/smartplants.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <article class="auth-panel">
        <p class="eyebrow">Registro</p>
        <h1>Crea tu perfil verde</h1>
        <p class="muted-text">Registra un usuario para usarlo despues en inventario y cuidados.</p>

        @if (error(); as currentError) {
          <div class="form-message error">{{ currentError }}</div>
        }

        <form class="form-stack" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nombre
            <input type="text" formControlName="nombre" placeholder="Daniel" />
            @if (isInvalid('nombre')) {
              <span class="field-error">El nombre es obligatorio.</span>
            }
          </label>
          <label>
            Email
            <input type="email" formControlName="email" placeholder="daniel@email.com" />
            @if (isInvalid('email')) {
              <span class="field-error">El email es obligatorio y debe ser valido.</span>
            }
          </label>
          <label>
            Password
            <input type="password" formControlName="password" placeholder="123456" />
            @if (isInvalid('password')) {
              <span class="field-error">El password es obligatorio.</span>
            }
          </label>
          <label>
            Rol
            <select formControlName="rol">
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Creando...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="auth-note">
          Ya tienes cuenta?
          <a routerLink="/login">Iniciar sesion</a>
        </p>
      </article>

      <aside class="auth-visual soft-visual">
        <img
          src="https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80"
          alt="Hojas verdes con luz natural"
        />
      </aside>
    </section>
  `,
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', Validators.required),
    rol: this.fb.nonNullable.control<Rol>('USER'),
  });

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loading.set(true);

    this.auth.register({
      nombre: raw.nombre.trim(),
      email: raw.email.trim(),
      password: raw.password,
      rol: raw.rol,
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { registered: '1' } }),
        error: (error) => this.error.set(this.extractError(error)),
      });
  }

  isInvalid(controlName: 'nombre' | 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'No fue posible crear la cuenta.';
    }

    return 'No fue posible crear la cuenta.';
  }
}
