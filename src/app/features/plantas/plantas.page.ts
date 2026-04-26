import { Component } from '@angular/core';

interface PlantCard {
  name: string;
  family: string;
  maintenance: string;
  health: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-plantas-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Catalogo</p>
        <h1>Plantas en cards</h1>
        <p class="muted-text">Vista preparada para listar el catalogo desde /api/plantas.</p>
      </div>
      <button type="button">Nueva planta</button>
    </section>

    <section class="plant-card-grid">
      @for (plant of plants; track plant.name) {
        <article class="plant-card">
          @if (plant.imageUrl) {
            <img [src]="plant.imageUrl" [alt]="plant.name" />
          } @else {
            <div class="image-fallback">{{ plant.name.slice(0, 2) }}</div>
          }

          <div class="plant-card-body">
            <span class="status-pill">{{ plant.maintenance }}</span>
            <h2>{{ plant.name }}</h2>
            <p>{{ plant.family }}</p>
            <div class="meta-row">
              <span>{{ plant.health }}</span>
              <span>Detalle</span>
            </div>
          </div>
        </article>
      }
    </section>
  `,
})
export class PlantasPage {
  readonly plants: PlantCard[] = [
    {
      name: 'Monstera deliciosa',
      family: 'Araceae',
      maintenance: 'MEDIO',
      health: 'Sana',
      imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Pothos dorado',
      family: 'Epipremnum',
      maintenance: 'BAJO',
      health: 'Excelente',
      imageUrl: 'https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Sansevieria',
      family: 'Asparagaceae',
      maintenance: 'BAJO',
      health: 'Estable',
    },
  ];
}
