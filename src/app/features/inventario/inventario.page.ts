import { Component } from '@angular/core';

interface FeedItem {
  name: string;
  nickname: string;
  date: string;
  note: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-inventario-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Galeria personal</p>
        <h1>Inventario tipo feed</h1>
        <p class="muted-text">Espacio preparado para usar usuarioId real despues del login.</p>
      </div>
      <button type="button">Agregar planta</button>
    </section>

    <section class="feed-grid">
      @for (item of feed; track item.nickname) {
        <article class="feed-card">
          @if (item.imageUrl) {
            <img [src]="item.imageUrl" [alt]="item.nickname" />
          } @else {
            <div class="image-fallback">{{ item.name.slice(0, 2) }}</div>
          }
          <div class="feed-body">
            <div>
              <span class="status-pill">{{ item.date }}</span>
              <h2>{{ item.nickname }}</h2>
              <p>{{ item.name }}</p>
            </div>
            <p>{{ item.note }}</p>
          </div>
        </article>
      }
    </section>
  `,
})
export class InventarioPage {
  readonly feed: FeedItem[] = [
    {
      name: 'Monstera',
      nickname: 'La grande de la sala',
      date: 'Agregada hoy',
      note: 'Lista para enlazar con detalle de inventario y cuidados.',
      imageUrl: 'https://images.unsplash.com/photo-1604762525957-6de9746f2d5e?auto=format&fit=crop&w=900&q=80',
    },
    {
      name: 'Cactus',
      nickname: 'Cactus de ventana',
      date: 'Hace 3 dias',
      note: 'Card con fallback e imagen externa opcional.',
      imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=900&q=80',
    },
  ];
}
