import { Component } from '@angular/core';

@Component({
  selector: 'app-cuidados-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Seguimiento</p>
        <h1>Cuidados por planta</h1>
        <p class="muted-text">Panel listo para registrar riego, poda, abono y proxima fecha sugerida.</p>
      </div>
      <button type="button">Registrar cuidado</button>
    </section>

    <section class="layer-grid">
      <article class="content-card">
        <h2>Registro rapido</h2>
        <form class="form-stack">
          <label>
            Planta de inventario
            <select>
              <option>La grande de la sala</option>
              <option>Cactus de ventana</option>
            </select>
          </label>
          <label>
            Tipo de cuidado
            <select>
              <option>RIEGO</option>
              <option>ABONO</option>
              <option>PODA</option>
            </select>
          </label>
          <label>
            Observacion
            <textarea rows="4" placeholder="Tierra seca, riego moderado"></textarea>
          </label>
          <button type="button">Guardar cuidado</button>
        </form>
      </article>

      <article class="timeline-card">
        <h2>Linea de tiempo</h2>
        <ol class="timeline">
          <li>
            <strong>RIEGO</strong>
            <span>Hoy</span>
            <p>Proxima fecha sugerida calculada por el backend.</p>
          </li>
          <li>
            <strong>ABONO</strong>
            <span>Hace 10 dias</span>
            <p>Historial preparado para /api/inventario/:id/cuidados.</p>
          </li>
        </ol>
      </article>
    </section>
  `,
})
export class CuidadosPage {}
