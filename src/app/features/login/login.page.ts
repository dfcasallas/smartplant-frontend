import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-page">
      <article class="auth-panel">
        <p class="eyebrow">Acceso</p>
        <h1>Bienvenido de nuevo</h1>
        <p class="muted-text">Ingresa con el usuario registrado en SmartPlant.</p>

        @if (message(); as currentMessage) {
          <div class="form-message success">{{ currentMessage }}</div>
        }

        @if (error(); as currentError) {
          <div class="form-message error">{{ currentError }}</div>
        }

        <form class="form-stack" [formGroup]="form" (ngSubmit)="submit()">
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
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <p class="auth-note">
          Nuevo en SmartPlant?
          <a routerLink="/register">Crear cuenta</a>
        </p>
      </article>

      <aside class="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80"
          alt="Plantas pequenas en macetas"
        />
      </aside>
    </section>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly message = signal<string | null>(
    this.route.snapshot.queryParamMap.get('registered') ? 'Cuenta creada. Ahora puedes iniciar sesion.' : null,
  );

  readonly form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', Validators.required),
  });

  submit(): void {
    this.error.set(null);
    this.message.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.auth.login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl('/inicio'),
        error: (error) => this.error.set(this.extractError(error)),
      });
  }

  isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'No fue posible iniciar sesion.';
    }

    return 'No fue posible iniciar sesion.';
  }
}
