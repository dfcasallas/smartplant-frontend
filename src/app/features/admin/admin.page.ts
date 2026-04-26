import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Admin</p>
        <h1>Panel de control</h1>
        <p class="muted-text">Estadisticas base inspiradas en SmartPlant 2.0.</p>
      </div>
    </section>

    <section class="summary-grid">
      @for (item of stats; track item.label) {
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
          <p class="eyebrow">Reporte</p>
          <h2>Especies populares</h2>
        </div>
      </div>

      <div class="table-shell">
        <table>
          <thead>
            <tr>
              <th>Especie</th>
              <th>Usuarios</th>
              <th>Cuidados</th>
              <th>Tendencia</th>
            </tr>
          </thead>
          <tbody>
            @for (row of popularSpecies; track row.name) {
              <tr>
                <td>{{ row.name }}</td>
                <td>{{ row.users }}</td>
                <td>{{ row.cares }}</td>
                <td>{{ row.trend }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class AdminPage {
  readonly stats = [
    { label: 'Total usuarios', value: '24', detail: 'GET /api/usuarios' },
    { label: 'Plantas catalogo', value: '18', detail: 'GET /api/plantas' },
    { label: 'Inventario activo', value: '31', detail: 'por usuario' },
    { label: 'Cuidados registrados', value: '42', detail: 'historial' },
  ];

  readonly popularSpecies = [
    { name: 'Monstera', users: 8, cares: 16, trend: 'Alta' },
    { name: 'Cactus', users: 6, cares: 9, trend: 'Media' },
    { name: 'Pothos', users: 5, cares: 11, trend: 'Alta' },
  ];
}
