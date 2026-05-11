import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Mantenimiento, SugerenciaResponse } from '../../models/smartplants.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-sugerencias-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Encuesta</p>
        <h1>Sugerencias reales</h1>
        <p class="muted-text">Completa tus preferencias y consulta /api/sugerencias.</p>
      </div>
    </section>

    @if (error(); as currentError) {
      <div class="form-message error">{{ currentError }}</div>
    }

    <section class="layer-grid">
      <article class="content-card">
        <h2>Preferencias</h2>

        @if (loadingCatalogo()) {
          <p class="muted-text panel-note">Cargando mantenimientos...</p>
        } @else {
          <form class="form-stack" [formGroup]="form" (ngSubmit)="buscarSugerencia()">
            <label>
              Nivel de mantenimiento
              <select formControlName="mantenimiento">
                <option value="">Selecciona un nivel</option>
                @for (item of mantenimientos(); track item.id) {
                  <option [value]="item.valor">{{ item.valor }}</option>
                }
              </select>
              @if (isInvalid('mantenimiento')) {
                <span class="field-error">El mantenimiento es obligatorio.</span>
              }
            </label>
            <label>
              Luz
              <input type="number" min="1" max="5" formControlName="luz" />
            </label>
            <label>
              Riego
              <input type="number" min="1" max="5" formControlName="riego" />
            </label>
            <label>
              Temperatura
              <input type="number" min="1" max="5" formControlName="temperatura" />
            </label>
            <label>
              Tamano
              <input type="number" min="1" max="5" formControlName="tamano" />
            </label>
            <label>
              Ambiente
              <input type="number" min="1" max="5" formControlName="ambiente" />
            </label>

            @if (hasInvalidNumber()) {
              <span class="field-error">Los valores numericos deben estar entre 1 y 5.</span>
            }

            <button type="submit" [disabled]="loadingSugerencia()">
              {{ loadingSugerencia() ? 'Buscando...' : 'Buscar sugerencia' }}
            </button>
          </form>
        }
      </article>

      <article class="suggestion-card">
        @if (resultado(); as sugerencia) {
          <div class="image-fallback">{{ sugerencia.nombre.slice(0, 2) }}</div>
          <div>
            <span class="status-pill">Match {{ sugerencia.puntaje }}/5</span>
            <h2>{{ sugerencia.nombre }}</h2>
            <p>{{ sugerencia.descripcion || 'Sin descripcion registrada.' }}</p>
            <p class="muted-text">Mantenimiento: {{ sugerencia.mantenimiento || 'Sin dato' }}</p>
            <p class="muted-text">plantaId: {{ sugerencia.plantaId }}</p>
          </div>
        } @else {
          <div class="image-fallback">SP</div>
          <div>
            <span class="status-pill">Sin consulta</span>
            <h2>Resultado pendiente</h2>
            <p>La planta sugerida aparecera aqui despues de enviar preferencias reales.</p>
          </div>
        }
      </article>
    </section>
  `,
})
export class SugerenciasPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly mantenimientos = signal<Mantenimiento[]>([]);
  readonly resultado = signal<SugerenciaResponse | null>(null);
  readonly loadingCatalogo = signal(false);
  readonly loadingSugerencia = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = new FormGroup({
    mantenimiento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    luz: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    riego: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    temperatura: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    tamano: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
    ambiente: new FormControl(2, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(5)] }),
  });

  ngOnInit(): void {
    this.cargarMantenimientos();
  }

  buscarSugerencia(): void {
    this.error.set(null);
    this.resultado.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.loadingSugerencia.set(true);

    this.api.sugerirPlanta(raw)
      .pipe(finalize(() => this.loadingSugerencia.set(false)))
      .subscribe({
        next: (resultado) => this.resultado.set(resultado),
        error: (error) => this.error.set(this.extractError(error, 'No fue posible obtener sugerencia.')),
      });
  }

  isInvalid(controlName: 'mantenimiento'): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  hasInvalidNumber(): boolean {
    return [
      this.form.controls.luz,
      this.form.controls.riego,
      this.form.controls.temperatura,
      this.form.controls.tamano,
      this.form.controls.ambiente,
    ].some((control) => control.invalid && (control.touched || control.dirty));
  }

  private cargarMantenimientos(): void {
    this.loadingCatalogo.set(true);
    this.api.getMantenimientos()
      .pipe(finalize(() => this.loadingCatalogo.set(false)))
      .subscribe({
        next: (mantenimientos) => {
          this.mantenimientos.set(mantenimientos);
          const first = mantenimientos[0];
          if (first) {
            this.form.controls.mantenimiento.setValue(first.valor);
          }
        },
        error: (error) => this.error.set(this.extractError(error, 'No fue posible cargar mantenimientos.')),
      });
  }

  private extractError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || fallback;
    }

    return fallback;
  }
}
