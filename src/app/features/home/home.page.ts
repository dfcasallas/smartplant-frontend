import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FeaturedPlant {
  name: string;
  detail: string;
  status: string;
  light: number;
  water: number;
  care: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  template: `
    <section class="page-hero dashboard-hero">
      <div>
        <p class="eyebrow">SmartPlant 3.0</p>
        <h1>Tu jardin inteligente, siempre bajo control.</h1>
        <p class="hero-copy">
          Gestiona tus plantas con inventario real, cuidados por linea de tiempo,
          sugerencias inteligentes y un asistente IA conectado al backend.
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
          <span class="metric-icon" [class]="item.tone">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.detail }}</small>
        </article>
      }
    </section>

    <section class="section-block">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Catalogo</p>
          <h2>Plantas destacadas</h2>
        </div>
        <a class="text-link" routerLink="/plantas">Explorar todas</a>
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
              <p class="muted-text">{{ plant.detail }}</p>
              <div class="plant-bars">
                <div class="bar-row">
                  <span>Luz</span>
                  <div><i [style.width.%]="plant.light * 20"></i></div>
                </div>
                <div class="bar-row">
                  <span>Agua</span>
                  <div><i class="blue" [style.width.%]="plant.water * 20"></i></div>
                </div>
                <div class="bar-row">
                  <span>Cuidado</span>
                  <div><i class="amber" [style.width.%]="plant.care * 20"></i></div>
                </div>
              </div>
            </div>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .plant-bars {
        display: grid;
        gap: 6px;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 58px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
        color: var(--muted);
        font-size: 0.78rem;
      }

      .bar-row div {
        height: 6px;
        overflow: hidden;
        border-radius: 999px;
        background: var(--surface-muted);
      }

      .bar-row i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: var(--primary);
      }

      .bar-row i.blue {
        background: var(--blue);
      }

      .bar-row i.amber {
        background: #ef9f27;
      }
    `,
  ],
})
export class HomePage {
  readonly summary = [
    { label: 'Usuarios', value: '24', detail: 'perfiles activos', icon: 'US', tone: '' },
    { label: 'Plantas catalogo', value: '18', detail: 'disponibles', icon: 'PL', tone: 'blue' },
    { label: 'Cuidados', value: '42', detail: 'registrados', icon: 'CU', tone: 'amber' },
    { label: 'Sugerencias', value: '8', detail: 'generadas', icon: 'IA', tone: 'violet' },
  ];

  readonly featuredPlants: FeaturedPlant[] = [
    {
      name: 'Monstera deliciosa',
      detail: 'Interior luminoso, riego moderado y hojas amplias.',
      status: 'Popular',
      light: 4,
      water: 3,
      care: 3,
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Cactus de ventana',
      detail: 'Bajo mantenimiento para espacios secos y soleados.',
      status: 'Bajo cuidado',
      light: 5,
      water: 1,
      care: 1,
      imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Helecho',
      detail: 'Ideal para ambientes frescos con humedad estable.',
      status: 'Interior',
      light: 2,
      water: 4,
      care: 4,
      imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=900&q=80',
    },
  ];
}
