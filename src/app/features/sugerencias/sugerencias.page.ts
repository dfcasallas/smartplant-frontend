import { Component } from '@angular/core';

@Component({
  selector: 'app-sugerencias-page',
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Encuesta</p>
        <h1>Sugerencias visuales</h1>
        <p class="muted-text">Base para conectar preferencias con /api/sugerencias.</p>
      </div>
    </section>

    <section class="layer-grid">
      <article class="content-card">
        <h2>Preferencias</h2>
        <form class="form-stack">
          <label>
            Nivel de mantenimiento
            <select>
              <option>BAJO</option>
              <option>MEDIO</option>
              <option>ALTO</option>
            </select>
          </label>
          <label>
            Luz
            <input type="number" min="1" max="5" value="2" />
          </label>
          <label>
            Riego
            <input type="number" min="1" max="5" value="2" />
          </label>
          <button type="button">Buscar sugerencia</button>
        </form>
      </article>

      <article class="suggestion-card">
        <img
          src="https://images.unsplash.com/photo-1530968464165-7a1861cbaf9f?auto=format&fit=crop&w=900&q=80"
          alt="Planta sugerida"
        />
        <div>
          <span class="status-pill">Match 4/5</span>
          <h2>Planta sugerida</h2>
          <p>Resultado preparado para mostrar nombre, descripcion, mantenimiento y puntaje.</p>
        </div>
      </article>
    </section>
  `,
})
export class SugerenciasPage {}
