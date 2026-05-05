import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CuidadoPlantaResponse, InventarioResponse, TipoCuidado } from '../../models/smartplants.models';
import { AuthService } from '../../services/auth.service';
import { CuidadosService } from '../../services/cuidados.service';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-cuidados-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Seguimiento</p>
        <h1>Cuidados por planta</h1>
        <p class="muted-text">Registra cuidados y consulta el historial real de cada planta de tu inventario.</p>
      </div>
      <button type="button" [disabled]="loadingInventario()" (click)="recargarInventario()">
        {{ loadingInventario() ? 'Cargando...' : 'Actualizar inventario' }}
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
        <h2>Registro rapido</h2>
        @if (loadingInventario()) {
          <p class="muted-text panel-note">Cargando inventario...</p>
        } @else if (inventario().length === 0) {
          <p class="muted-text panel-note">No tienes plantas en inventario. Agrega una planta para registrar cuidados.</p>
        } @else {
          <form class="form-stack" [formGroup]="form" (ngSubmit)="guardarCuidado()">
            <label>
              Planta de inventario
              <select formControlName="inventarioId" (change)="cambiarInventario()">
                @for (item of inventario(); track item.id) {
                  <option [value]="item.id">{{ nombreInventario(item) }}</option>
                }
              </select>
            </label>
            <label>
              Tipo de cuidado
              <select formControlName="tipoCuidado">
                @for (tipo of tiposCuidado; track tipo.value) {
                  <option [value]="tipo.value">{{ tipo.label }}</option>
                }
              </select>
            </label>
            <label>
              Observacion
              <textarea rows="4" formControlName="observacion" placeholder="Tierra seca, riego moderado"></textarea>
              @if (form.controls.observacion.invalid && form.controls.observacion.dirty) {
                <span class="field-error">La observacion no puede superar 300 caracteres.</span>
              }
            </label>
            <button type="submit" [disabled]="saving() || loadingCuidados()">
              {{ saving() ? 'Guardando...' : 'Guardar cuidado' }}
            </button>
          </form>
        }
      </article>

      <article class="timeline-card">
        <h2>Linea de tiempo</h2>
        @if (loadingCuidados()) {
          <p class="muted-text panel-note">Cargando cuidados...</p>
        } @else if (!selectedInventarioId()) {
          <p class="muted-text panel-note">Selecciona una planta de inventario para ver su historial.</p>
        } @else if (cuidados().length === 0) {
          <p class="muted-text panel-note">Esta planta aun no tiene cuidados registrados.</p>
        } @else {
          <ol class="timeline">
            @for (cuidado of cuidados(); track cuidado.id) {
              <li>
                <strong>{{ cuidado.tipoCuidado }}</strong>
                <span>{{ formatoFecha(cuidado.fecha) }}</span>
                <p>{{ cuidado.observacion || 'Sin observacion.' }}</p>
                <small>Proxima fecha sugerida: {{ formatoFecha(cuidado.proximaFechaSugerida) }}</small>
              </li>
            }
          </ol>
        }
      </article>
    </section>
  `,
})
export class CuidadosPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly inventarioService = inject(InventarioService);
  private readonly cuidadosService = inject(CuidadosService);

  readonly inventario = signal<InventarioResponse[]>([]);
  readonly cuidados = signal<CuidadoPlantaResponse[]>([]);
  readonly loadingInventario = signal(false);
  readonly loadingCuidados = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly tiposCuidado: Array<{ value: TipoCuidado; label: string }> = [
    { value: 'RIEGO', label: 'RIEGO' },
    { value: 'EXPOSICION_SOL', label: 'EXPOSICION_SOL' },
    { value: 'ABONO', label: 'ABONO' },
    { value: 'PODA', label: 'PODA' },
    { value: 'CAMBIO_UBICACION', label: 'CAMBIO_UBICACION' },
  ];

  readonly form = new FormGroup({
    inventarioId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tipoCuidado: new FormControl<TipoCuidado>('RIEGO', { nonNullable: true, validators: [Validators.required] }),
    observacion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(300)] }),
  });

  ngOnInit(): void {
    this.recargarInventario();
  }

  recargarInventario(): void {
    const usuario = this.auth.getCurrentUser();
    this.error.set(null);
    this.success.set(null);
    this.cuidados.set([]);

    if (!usuario) {
      this.inventario.set([]);
      this.error.set('No hay usuario autenticado. Inicia sesion para consultar tus cuidados.');
      return;
    }

    this.loadingInventario.set(true);
    this.inventarioService.getInventarioPorUsuario(usuario.id)
      .pipe(finalize(() => this.loadingInventario.set(false)))
      .subscribe({
        next: (inventario) => {
          this.inventario.set(inventario);
          const firstInventario = inventario[0];

          if (!firstInventario) {
            this.form.controls.inventarioId.setValue('');
            return;
          }

          this.form.controls.inventarioId.setValue(String(firstInventario.id));
          this.cargarCuidados(firstInventario.id);
        },
        error: (error) => this.error.set(this.extractError(error, 'No fue posible cargar el inventario.')),
      });
  }

  cambiarInventario(): void {
    this.error.set(null);
    this.success.set(null);
    this.cuidados.set([]);

    const inventarioId = this.selectedInventarioId();
    if (!inventarioId) {
      return;
    }

    this.cargarCuidados(inventarioId);
  }

  guardarCuidado(): void {
    this.error.set(null);
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const inventarioId = this.selectedInventarioId();
    if (!inventarioId) {
      this.error.set('Selecciona una planta de inventario.');
      return;
    }

    const observacion = this.form.controls.observacion.value.trim();
    this.saving.set(true);

    this.cuidadosService.registrar(inventarioId, {
      tipoCuidado: this.form.controls.tipoCuidado.value,
      observacion: observacion || null,
    }).pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.success.set('Cuidado registrado correctamente.');
          this.form.controls.observacion.reset('');
          this.cargarCuidados(inventarioId);
        },
        error: (error) => this.error.set(this.extractError(error, 'No fue posible registrar el cuidado.')),
      });
  }

  nombreInventario(item: InventarioResponse): string {
    return item.nombrePersonalizado ? `${item.nombrePersonalizado} (${item.nombrePlanta})` : item.nombrePlanta;
  }

  formatoFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(`${fecha}T00:00:00`));
  }

  selectedInventarioId(): number | null {
    return this.parseId(this.form.controls.inventarioId.value);
  }

  private cargarCuidados(inventarioId: number): void {
    this.loadingCuidados.set(true);
    this.cuidadosService.listarPorInventario(inventarioId)
      .pipe(finalize(() => this.loadingCuidados.set(false)))
      .subscribe({
        next: (cuidados) => this.cuidados.set(cuidados),
        error: (error) => this.error.set(this.extractError(error, 'No fue posible cargar la linea de tiempo.')),
      });
  }

  private parseId(value: string): number | null {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  private extractError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || fallback;
    }

    return fallback;
  }
}
