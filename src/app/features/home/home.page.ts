import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FeaturedPlant {
  name: string;
  detail: string;
  status: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="page-hero dashboard-hero">
      <div>
        <p class="eyebrow">SmartPlant 3.0</p>
        <h1>Tu espacio visual para plantas, cuidados e inventario.</h1>
        <p class="hero-copy">
          Una base limpia para conectar login, sugerencias y seguimiento de plantas en las siguientes fases.
        </p>
        <div class="hero-actions">
          <a class="primary-action" routerLink="/plantas">Ver plantas</a>
          <a class="secondary-action" routerLink="/inventario">Abrir inventario</a>
        </div>
      </div>

      <div class="hero-preview">
        <img
          src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80"
          alt="Plantas verdes en macetas"
        />
      </div>
    </section>

    <section class="summary-grid">
      @for (item of summary; track item.label) {
        <article class="metric-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.detail }}</small>
        </article>
      }
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Feed principal</p>
          <h2>Plantas destacadas</h2>
        </div>
        <a class="text-link" routerLink="/plantas">Explorar</a>
      </div>

      <div class="plant-card-grid">
        @for (plant of featuredPlants; track plant.name) {
          <article class="plant-card">
            @if (plant.imageUrl) {
              <img [src]="plant.imageUrl" [alt]="plant.name" />
            } @else {
              <div class="image-fallback">{{ plant.name.slice(0, 2) }}</div>
            }
            <div class="plant-card-body">
              <span class="status-pill">{{ plant.status }}</span>
              <h3>{{ plant.name }}</h3>
              <p>{{ plant.detail }}</p>
            </div>
          </article>
        }
      </div>
    </section>
  `,
})
export class HomePage {
  readonly summary = [
    { label: 'Usuarios', value: '24', detail: 'base para reporte admin' },
    { label: 'Plantas', value: '18', detail: 'catalogo visible' },
    { label: 'Cuidados', value: '42', detail: 'seguimiento semanal' },
    { label: 'Sugerencias', value: '8', detail: 'encuestas preparadas' },
  ];

  readonly featuredPlants: FeaturedPlant[] = [
    {
      name: 'Monstera',
      detail: 'Interior luminoso, riego moderado y hojas amplias.',
      status: 'Popular',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Cactus mini',
      detail: 'Bajo mantenimiento para espacios secos y soleados.',
      status: 'Bajo cuidado',
      imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Helecho',
      detail: 'Ideal para ambientes frescos con humedad estable.',
      status: 'Interior',
      imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
    },
  ];
}
