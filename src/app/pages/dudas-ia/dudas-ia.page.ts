import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-dudas-ia-page',
  imports: [ReactiveFormsModule],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Asistente IA</p>
        <h1>Dudas con IA</h1>
        <p class="muted-text">Haz una pregunta sobre cuidado de plantas y recibe una respuesta practica.</p>
      </div>
    </section>

    <section class="ai-grid">
      <article class="content-card">
        <h2>Tu pregunta</h2>
        <form class="form-stack" [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Duda sobre plantas
            <textarea
              rows="8"
              formControlName="pregunta"
              placeholder="Ejemplo: Por que mi monstera tiene hojas amarillas?"
            ></textarea>
            @if (isInvalid()) {
              <span class="field-error">Escribe una pregunta antes de consultar.</span>
            }
          </label>

          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'Consultando...' : 'Preguntar' }}
          </button>
        </form>

        @if (error(); as currentError) {
          <div class="form-message error">{{ currentError }}</div>
        }
      </article>

      <article class="content-card ai-answer-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Respuesta</p>
            <h2>Guia de cuidado</h2>
          </div>
          @if (loading()) {
            <span class="status-pill">Pensando...</span>
          }
        </div>

        @if (answer(); as currentAnswer) {
          <div class="ai-answer">{{ currentAnswer }}</div>
        } @else {
          <div class="empty-state">
            <strong>Sin consulta todavia</strong>
            <p>La respuesta aparecera aqui despues de enviar tu pregunta.</p>
          </div>
        }
      </article>
    </section>
  `,
  styles: [
    `
      .ai-grid {
        display: grid;
        gap: 18px;
        grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      }

      textarea {
        min-height: 210px;
        resize: vertical;
      }

      .ai-answer-card {
        min-height: 360px;
      }

      .ai-answer {
        background: var(--surface-soft);
        border: 1px solid var(--line);
        border-radius: 8px;
        color: var(--text);
        line-height: 1.7;
        margin-top: 14px;
        padding: 18px;
        white-space: pre-wrap;
      }

      .empty-state {
        align-items: center;
        background: var(--soft-green);
        border-radius: 8px;
        color: var(--primary-dark);
        display: grid;
        gap: 8px;
        margin-top: 14px;
        min-height: 220px;
        padding: 24px;
        text-align: center;
      }

      .empty-state p {
        color: var(--muted);
      }

      @media (max-width: 980px) {
        .ai-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DudasIaPage {
  private readonly fb = inject(FormBuilder);
  private readonly chatService = inject(ChatService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly answer = signal<string | null>(null);

  readonly form = this.fb.group({
    pregunta: this.fb.nonNullable.control('', Validators.required),
  });

  submit(): void {
    this.error.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const pregunta = this.form.getRawValue().pregunta.trim();
    this.loading.set(true);

    this.chatService.preguntar({ pregunta })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.answer.set(response.respuesta),
        error: (error) => this.error.set(this.extractError(error)),
      });
  }

  isInvalid(): boolean {
    const control = this.form.controls.pregunta;
    return control.invalid && (control.touched || control.dirty);
  }

  private extractError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message || 'No fue posible consultar la IA.';
    }

    return 'No fue posible consultar la IA.';
  }
}
