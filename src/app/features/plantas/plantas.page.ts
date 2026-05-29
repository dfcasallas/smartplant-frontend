import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Planta } from '../../models/smartplants.models';
import { ApiService } from '../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-plantas-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Catalogo</p>
        <h1>Plantas disponibles</h1>
        <p class="muted-text">Catalogo real cargado desde /api/plantas.</p>
      </div>
      <button type="button" [disabled]="loading()" (click)="cargarPlantas()">
        {{ loading() ? 'Cargando...' : 'Actualizar' }}
      </button>
    </section>

    @if (error(); as currentError) {
      <div class="form-message error">{{ currentError }}</div>
    }

    @if (loading()) {
      <section class="section-block">
        <p class="muted-text">Cargando plantas...</p>
      </section>
    } @else if (plantas().length === 0) {
      <section class="empty-state">
        <div>
          <strong>No hay plantas en el catalogo</strong>
          <p class="muted-text">Cuando el backend tenga datos, apareceran aqui.</p>
        </div>
      </section>
    } @else {
      <section class="plant-card-grid">
        @for (plant of plantas(); track plant.id) {
          <article class="plant-card">
            @if (plant.imageUrl) {
              <img [src]="plant.imageUrl" [alt]="plant.nombre" />
            } @else {
              <div class="image-fallback">{{ plant.nombre.slice(0, 2) }}</div>
            }

            <div class="plant-card-body">
              <span class="status-pill">{{ plant.mantenimiento.valor }}</span>
              <h2>{{ plant.nombre }}</h2>
              <p class="muted-text">{{ plant.descripcion || 'Sin descripcion registrada.' }}</p>
              <div class="meta-row">
                <span>{{ plant.familia.valor }}</span>
                <span>{{ plant.tipo.valor }}</span>
              </div>
              <div class="meta-row">
                <span>Salud</span>
                <strong>{{ plant.salud.valor }}</strong>
              </div>
            </div>
          </article>
        }
      </section>
    }
  `,
})
export class PlantasPage implements OnInit {
  private readonly api = inject(ApiService);

  readonly plantas = signal<Planta[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarPlantas();
  }

  cargarPlantas(): void {
    this.error.set(null);
    this.loading.set(true);

    this.api.getPlantas()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (plantas) => this.plantas.set(plantas),
        error: (error) => this.error.set(this.extractError(error)),
      });
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'No fue posible cargar el catalogo.';
    }

    return 'No fue posible cargar el catalogo.';
  }
}
