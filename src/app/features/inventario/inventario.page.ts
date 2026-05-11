import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { InventarioResponse, Planta } from '../../models/smartplants.models';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Galeria personal</p>
        <h1>Inventario real</h1>
        <p class="muted-text">Agrega plantas del catalogo y consulta tu inventario persistente.</p>
      </div>
      <button type="button" [disabled]="loading()" (click)="recargar()">
        {{ loading() ? 'Cargando...' : 'Actualizar' }}
      </button>
    </section>

    @if (success(); as currentSuccess) {
      <div class="form-message success">{{ currentSuccess }}</div>
    }

    @if (error(); as currentError) {
      <div class="form-message error">{{ currentError }}</div>
    }

    <section class="layer-grid">
      <article class="content-card">
        <h2>Agregar planta</h2>

        @if (plantas().length === 0 && !loading()) {
          <p class="muted-text panel-note">No hay plantas disponibles en el catalogo.</p>
        } @else {
          <form class="form-stack" [formGroup]="form" (ngSubmit)="agregarPlanta()">
            <label>
              Planta
              <select formControlName="plantaId">
                <option value="">Selecciona una planta</option>
                @for (planta of plantas(); track planta.id) {
                  <option [value]="planta.id">{{ planta.nombre }}</option>
                }
              </select>
              @if (isInvalid('plantaId')) {
                <span class="field-error">Selecciona una planta del catalogo.</span>
              }
            </label>

            <label>
              Nombre personalizado
              <input type="text" formControlName="nombrePersonalizado" placeholder="Ejemplo: Monstera de la sala" />
              @if (isInvalid('nombrePersonalizado')) {
                <span class="field-error">El nombre personalizado es obligatorio.</span>
              }
            </label>

            <button type="submit" [disabled]="saving() || loading()">
              {{ saving() ? 'Agregando...' : 'Agregar planta' }}
            </button>
          </form>
        }
      </article>

      <article class="content-card">
        <h2>Resumen</h2>
        <p class="muted-text panel-note">
          Total en inventario: <strong>{{ inventario().length }}</strong>
        </p>
        <p class="muted-text panel-note">
          Usuario activo: <strong>{{ auth.getCurrentUser()?.nombre || 'Sin sesion' }}</strong>
        </p>
      </article>
    </section>

    @if (loading()) {
      <section class="section-block">
        <p class="muted-text">Cargando inventario...</p>
      </section>
    } @else if (inventario().length === 0) {
      <section class="section-block">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Estado vacio</p>
            <h2>Aun no tienes plantas guardadas</h2>
          </div>
        </div>
        <p class="muted-text">Usa el formulario para agregar una planta real desde el catalogo.</p>
      </section>
    } @else {
      <section class="feed-grid">
        @for (item of inventario(); track item.id) {
          <article class="feed-card">
            <div class="image-fallback">{{ item.nombrePlanta.slice(0, 2) }}</div>
            <div class="feed-body">
              <div>
                <span class="status-pill">{{ formatoFecha(item.fechaAgregado) }}</span>
                <h2>{{ item.nombrePersonalizado }}</h2>
                <p>{{ item.nombrePlanta }}</p>
              </div>
              <p>Inventario #{{ item.id }} · Planta #{{ item.plantaId }}</p>
            </div>
          </article>
        }
      </section>
    }
  `,
})
export class InventarioPage implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly inventarioService = inject(InventarioService);

  readonly plantas = signal<Planta[]>([]);
  readonly inventario = signal<InventarioResponse[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = new FormGroup({
    plantaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombrePersonalizado: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    const usuario = this.auth.getCurrentUser();
    this.error.set(null);

    if (!usuario) {
      this.plantas.set([]);
      this.inventario.set([]);
      this.error.set('No hay usuario autenticado. Inicia sesion para usar el inventario.');
      return;
    }

    this.loading.set(true);
    forkJoin({
      plantas: this.api.getPlantas(),
      inventario: this.inventarioService.getInventarioPorUsuario(usuario.id),
    }).pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ plantas, inventario }) => {
          this.plantas.set(plantas);
          this.inventario.set(inventario);
        },
        error: (error) => this.error.set(this.extractError(error, 'No fue posible cargar inventario y catalogo.')),
      });
  }

  agregarPlanta(): void {
    const usuario = this.auth.getCurrentUser();
    this.error.set(null);
    this.success.set(null);

    if (!usuario) {
      this.error.set('No hay usuario autenticado. Inicia sesion para agregar plantas.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const plantaId = Number(this.form.controls.plantaId.value);
    const nombrePersonalizado = this.form.controls.nombrePersonalizado.value.trim();

    if (!Number.isFinite(plantaId) || plantaId <= 0) {
      this.error.set('Selecciona una planta valida.');
      return;
    }

    this.saving.set(true);
    this.inventarioService.agregarPlanta(usuario.id, { plantaId, nombrePersonalizado })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Planta agregada al inventario.');
          this.form.reset({ plantaId: '', nombrePersonalizado: '' });
          this.recargar();
        },
        error: (error) => this.error.set(this.extractError(error, 'No fue posible agregar la planta.')),
      });
  }

  isInvalid(controlName: 'plantaId' | 'nombrePersonalizado'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  formatoFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${fecha}T00:00:00`));
  }

  private extractError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || fallback;
    }

    return fallback;
  }
}
