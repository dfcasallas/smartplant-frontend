import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

    <section class="layer-grid inventory-panel">
      <article class="content-card">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Nueva planta</p>
            <h2>Agregar al inventario</h2>
          </div>
          <span class="status-pill">{{ plantas().length }} opciones</span>
        </div>

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

      <article class="content-card inventory-summary">
        <span class="metric-icon">IV</span>
        <p class="eyebrow">Resumen</p>
        <strong>{{ inventario().length }}</strong>
        <span class="muted-text">plantas guardadas</span>
        <p class="muted-text panel-note">
          Usuario activo: <strong>{{ auth.getCurrentUser()?.nombre || 'Sin sesion' }}</strong>
        </p>
      </article>
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Mis plantas</p>
          <h2>Inventario persistente</h2>
        </div>
        <label class="search-bar">
          <span aria-hidden="true">Buscar</span>
          <input type="search" [value]="query()" (input)="query.set($any($event.target).value)" placeholder="Nombre o especie" />
        </label>
      </div>

      @if (loading()) {
        <p class="muted-text">Cargando inventario...</p>
      } @else if (inventario().length === 0) {
        <div class="empty-state">
          <div>
            <strong>Aun no tienes plantas guardadas</strong>
            <p class="muted-text">Usa el formulario para agregar una planta real desde el catalogo.</p>
          </div>
        </div>
      } @else if (inventarioFiltrado().length === 0) {
        <div class="empty-state">
          <div>
            <strong>Sin resultados</strong>
            <p class="muted-text">Prueba con otro nombre o especie.</p>
          </div>
        </div>
      } @else {
        <div class="feed-grid">
          @for (item of inventarioFiltrado(); track item.id) {
            <article class="feed-card inventory-card">
              <div class="image-fallback">{{ iniciales(item.nombrePlanta) }}</div>
              <div class="feed-body">
                <div>
                  <span class="status-pill">{{ formatoFecha(item.fechaAgregado) }}</span>
                  <h2>{{ item.nombrePersonalizado }}</h2>
                  <p class="muted-text">{{ item.nombrePlanta }}</p>
                </div>
                <div class="meta-row">
                  <span>Inventario #{{ item.id }}</span>
                  <strong>Planta #{{ item.plantaId }}</strong>
                </div>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .inventory-summary {
        align-content: start;
      }

      .inventory-summary strong {
        display: block;
        font-size: 3rem;
        line-height: 1;
        margin-top: 8px;
      }

      .compact-heading {
        margin-bottom: 0;
      }

      .inventory-card {
        display: grid;
        grid-template-columns: 132px minmax(0, 1fr);
      }

      .inventory-card .image-fallback {
        height: 100%;
        min-height: 150px;
        aspect-ratio: auto;
      }

      @media (max-width: 680px) {
        .inventory-card {
          grid-template-columns: 1fr;
        }

        .inventory-card .image-fallback {
          aspect-ratio: 16 / 9;
        }
      }
    `,
  ],
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
  readonly query = signal('');

  readonly inventarioFiltrado = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return this.inventario();
    }

    return this.inventario().filter((item) =>
      `${item.nombrePersonalizado} ${item.nombrePlanta}`.toLowerCase().includes(term),
    );
  });

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

  iniciales(nombre: string): string {
    return nombre.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }

  private extractError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || fallback;
    }

    return fallback;
  }
}
