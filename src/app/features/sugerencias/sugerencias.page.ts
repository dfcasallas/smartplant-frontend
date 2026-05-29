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
        <h1>Sugerencias inteligentes</h1>
        <p class="muted-text">Ajusta tus preferencias y consulta /api/sugerencias.</p>
      </div>
    </section>

    @if (error(); as currentError) {
      <div class="form-message error">{{ currentError }}</div>
    }

    <section class="layer-grid">
      <article class="content-card">
        <div class="section-heading compact-heading">
          <div>
            <p class="eyebrow">Preferencias</p>
            <h2>Tu planta ideal</h2>
          </div>
        </div>

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

            <div class="slider-stack">
              @for (item of sliderFields; track item.control) {
                <div class="slider-row">
                  <label [for]="item.control">{{ item.label }}</label>
                  <input
                    [id]="item.control"
                    type="range"
                    min="1"
                    max="5"
                    [formControlName]="item.control"
                  />
                  <span>{{ form.controls[item.control].value }}</span>
                </div>
              }
            </div>

            @if (hasInvalidNumber()) {
              <span class="field-error">Los valores numericos deben estar entre 1 y 5.</span>
            }

            <button type="submit" [disabled]="loadingSugerencia()">
              {{ loadingSugerencia() ? 'Buscando...' : 'Buscar planta ideal' }}
            </button>
          </form>
        }
      </article>

      <article class="suggestion-card result-panel">
        @if (resultado(); as sugerencia) {
          <div class="image-fallback">{{ sugerencia.nombre.slice(0, 2) }}</div>
          <div>
            <span class="status-pill">Match {{ sugerencia.puntaje }}/5</span>
            <h2>{{ sugerencia.nombre }}</h2>
            <p class="muted-text">{{ sugerencia.descripcion || 'Sin descripcion registrada.' }}</p>
            <p class="muted-text">Mantenimiento: {{ sugerencia.mantenimiento || 'Sin dato' }}</p>
            <p class="muted-text">plantaId: {{ sugerencia.plantaId }}</p>
          </div>
          <div>
            <p class="muted-text score-label">Compatibilidad</p>
            <div class="score-bar">
              @for (score of scoreDots(sugerencia.puntaje); track $index) {
                <span class="score-dot" [class.filled]="score"></span>
              }
            </div>
          </div>
        } @else {
          <div class="empty-state">
            <div>
              <strong>Resultado pendiente</strong>
              <p class="muted-text">La planta sugerida aparecera aqui despues de enviar preferencias reales.</p>
            </div>
          </div>
        }
      </article>
    </section>
  `,
  styles: [
    `
      .compact-heading {
        margin-bottom: 0;
      }

      .result-panel .image-fallback {
        border-radius: var(--radius);
      }

      .score-label {
        margin-bottom: 8px;
      }
    `,
  ],
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

  readonly sliderFields: Array<{ control: 'luz' | 'riego' | 'temperatura' | 'tamano' | 'ambiente'; label: string }> = [
    { control: 'luz', label: 'Luz' },
    { control: 'riego', label: 'Riego' },
    { control: 'temperatura', label: 'Temperatura' },
    { control: 'tamano', label: 'Tamano' },
    { control: 'ambiente', label: 'Ambiente' },
  ];

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

  scoreDots(score: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < score);
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
