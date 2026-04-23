import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  CatalogItem,
  CatalogKey,
  Familia,
  Mantenimiento,
  Planta,
  PlantaRequest,
  Salud,
  Tipo,
} from './models/smartplants.models';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);

  readonly loading = signal(false);
  readonly savingPlant = signal(false);
  readonly message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  readonly tipos = signal<Tipo[]>([]);
  readonly familias = signal<Familia[]>([]);
  readonly mantenimientos = signal<Mantenimiento[]>([]);
  readonly saludes = signal<Salud[]>([]);
  readonly plantas = signal<Planta[]>([]);

  readonly plantForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    tipoId: this.fb.control<number | null>(null, Validators.required),
    familiaId: this.fb.control<number | null>(null, Validators.required),
    mantenimientoId: this.fb.control<number | null>(null, Validators.required),
    saludId: this.fb.control<number | null>(null, Validators.required),
  });

  readonly tipoForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    valor: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
  });

  readonly familiaForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    valor: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
  });

  readonly mantenimientoForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    valor: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
  });

  readonly saludForm = this.fb.group({
    id: this.fb.control<number | null>(null),
    valor: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
  });

  readonly metricas = computed(() => [
    { label: 'Plantas registradas', value: this.plantas().length },
    { label: 'Tipos', value: this.tipos().length },
    { label: 'Familias', value: this.familias().length },
    { label: 'Estados de salud', value: this.saludes().length },
  ]);

  readonly catalogosListos = computed(
    () =>
      this.tipos().length > 0 &&
      this.familias().length > 0 &&
      this.mantenimientos().length > 0 &&
      this.saludes().length > 0,
  );

  readonly catalogSections: Array<{
    key: CatalogKey;
    title: string;
    description: string;
    placeholder: string;
  }> = [
    {
      key: 'tipos',
      title: 'Tipos',
      description: 'Clasifica si la planta es de interior, exterior, colgante, etc.',
      placeholder: 'Ej: Interior',
    },
    {
      key: 'familias',
      title: 'Familias',
      description: 'Agrupa especies o familias botánicas.',
      placeholder: 'Ej: Suculentas',
    },
    {
      key: 'mantenimientos',
      title: 'Mantenimiento',
      description: 'Define el nivel de cuidado requerido.',
      placeholder: 'Ej: Bajo',
    },
    {
      key: 'saludes',
      title: 'Salud',
      description: 'Estado general de la planta.',
      placeholder: 'Ej: Excelente',
    },
  ];

  constructor() {
    this.loadDashboard();
  }

  loadDashboard(showSuccess = false): void {
    this.loading.set(true);

    forkJoin({
      tipos: this.api.getTipos(),
      familias: this.api.getFamilias(),
      mantenimientos: this.api.getMantenimientos(),
      saludes: this.api.getSaludes(),
      plantas: this.api.getPlantas(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ tipos, familias, mantenimientos, saludes, plantas }) => {
          this.tipos.set(tipos);
          this.familias.set(familias);
          this.mantenimientos.set(mantenimientos);
          this.saludes.set(saludes);
          this.plantas.set(plantas);

          if (showSuccess) {
            this.showMessage('success', 'Datos sincronizados correctamente.');
          }
        },
        error: (error) => this.handleError('No fue posible cargar la información inicial.', error),
      });
  }

  guardarCatalogo(key: CatalogKey): void {
    const form = this.getCatalogForm(key);

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const id = form.controls.id.value;
    const valor = form.controls.valor.value.trim();
    const request = this.getCatalogRequest(key, valor);
    const action$ = this.resolveCatalogSaveRequest(key, id, request);

    action$.subscribe({
      next: () => {
        this.resetCatalogForm(key);
        this.loadDashboard();
        this.showMessage(
          'success',
          id ? `Catálogo ${this.getSectionTitle(key)} actualizado.` : `Catálogo ${this.getSectionTitle(key)} creado.`,
        );
      },
      error: (error: unknown) =>
        this.handleError(`No se pudo guardar ${this.getSectionTitle(key).toLowerCase()}.`, error),
    });
  }

  editarCatalogo(key: CatalogKey, item: CatalogItem): void {
    this.getCatalogForm(key).patchValue({
      id: item.id,
      valor: this.api.getCatalogLabel(item),
    });
  }

  cancelarEdicionCatalogo(key: CatalogKey): void {
    this.resetCatalogForm(key);
  }

  eliminarCatalogo(key: CatalogKey, item: CatalogItem): void {
    const label = this.api.getCatalogLabel(item);
    const confirmado = globalThis.confirm(
      `¿Seguro que deseas eliminar "${label}"? Si está asociado a una planta, PostgreSQL puede rechazar la operación.`,
    );

    if (!confirmado) {
      return;
    }

    this.resolveCatalogDeleteRequest(key, item.id).subscribe({
      next: () => {
        this.loadDashboard();
        this.showMessage('success', `Se eliminó "${label}".`);
      },
      error: (error) =>
        this.handleError(
          `No se pudo eliminar "${label}". Verifica si ese registro está siendo usado por alguna planta.`,
          error,
        ),
    });
  }

  guardarPlanta(): void {
    if (this.plantForm.invalid) {
      this.plantForm.markAllAsTouched();
      return;
    }

    const raw = this.plantForm.getRawValue();
    const request: PlantaRequest = {
      nombre: raw.nombre.trim(),
      tipo: { id: raw.tipoId! },
      familia: { id: raw.familiaId! },
      mantenimiento: { id: raw.mantenimientoId! },
      salud: { id: raw.saludId! },
    };

    const plantId = raw.id;
    const request$ = plantId
      ? this.api.updatePlanta(plantId, request)
      : this.api.createPlanta(request);

    this.savingPlant.set(true);

    request$
      .pipe(finalize(() => this.savingPlant.set(false)))
      .subscribe({
        next: () => {
          this.resetPlantForm();
          this.loadDashboard();
          this.showMessage(
            'success',
            plantId ? 'La planta fue actualizada correctamente.' : 'La planta fue creada correctamente.',
          );
        },
        error: (error) => this.handleError('No fue posible guardar la planta.', error),
      });
  }

  editarPlanta(planta: Planta): void {
    this.plantForm.patchValue({
      id: planta.id,
      nombre: planta.nombre,
      tipoId: planta.tipo.id,
      familiaId: planta.familia.id,
      mantenimientoId: planta.mantenimiento.id,
      saludId: planta.salud.id,
    });
  }

  cancelarEdicionPlanta(): void {
    this.resetPlantForm();
  }

  eliminarPlanta(planta: Planta): void {
    const confirmado = globalThis.confirm(`¿Deseas eliminar la planta "${planta.nombre}"?`);

    if (!confirmado) {
      return;
    }

    this.api.deletePlanta(planta.id).subscribe({
      next: () => {
        this.loadDashboard();
        this.showMessage('success', `La planta "${planta.nombre}" fue eliminada.`);
      },
      error: (error) => this.handleError('No fue posible eliminar la planta.', error),
    });
  }

  getCatalogItems(key: CatalogKey): CatalogItem[] {
    switch (key) {
      case 'tipos':
        return this.tipos();
      case 'familias':
        return this.familias();
      case 'mantenimientos':
        return this.mantenimientos();
      case 'saludes':
        return this.saludes();
    }
  }

  getCatalogValue(item: CatalogItem): string {
    return this.api.getCatalogLabel(item);
  }

  isEditingCatalog(key: CatalogKey): boolean {
    return this.getCatalogForm(key).controls.id.value !== null;
  }

  isFieldInvalid(formName: 'plant' | 'tipo' | 'familia' | 'mantenimiento' | 'salud', controlName: string): boolean {
    const form = this.getFormByName(formName) as { controls: Record<string, { invalid: boolean; touched: boolean; dirty: boolean } | undefined> };
    const control = form.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getCatalogForm(key: CatalogKey) {
    switch (key) {
      case 'tipos':
        return this.tipoForm;
      case 'familias':
        return this.familiaForm;
      case 'mantenimientos':
        return this.mantenimientoForm;
      case 'saludes':
        return this.saludForm;
    }
  }

  private getCatalogRequest(key: CatalogKey, valor: string): Record<string, string> {
    switch (key) {
      case 'tipos':
      case 'familias':
        return { nombre: valor };
      case 'mantenimientos':
        return { nivel: valor };
      case 'saludes':
        return { estado: valor };
    }
  }

  private resolveCatalogSaveRequest(
    key: CatalogKey,
    id: number | null,
    request: Record<string, string>,
  ): Observable<unknown> {
    switch (key) {
      case 'tipos':
        return id ? this.api.updateTipo(id, request) : this.api.createTipo(request);
      case 'familias':
        return id ? this.api.updateFamilia(id, request) : this.api.createFamilia(request);
      case 'mantenimientos':
        return id
          ? this.api.updateMantenimiento(id, request)
          : this.api.createMantenimiento(request);
      case 'saludes':
        return id ? this.api.updateSalud(id, request) : this.api.createSalud(request);
    }
  }

  private resolveCatalogDeleteRequest(key: CatalogKey, id: number): Observable<void> {
    switch (key) {
      case 'tipos':
        return this.api.deleteTipo(id);
      case 'familias':
        return this.api.deleteFamilia(id);
      case 'mantenimientos':
        return this.api.deleteMantenimiento(id);
      case 'saludes':
        return this.api.deleteSalud(id);
    }
  }

  private resetCatalogForm(key: CatalogKey): void {
    this.getCatalogForm(key).reset({
      id: null,
      valor: '',
    });
  }

  private resetPlantForm(): void {
    this.plantForm.reset({
      id: null,
      nombre: '',
      tipoId: null,
      familiaId: null,
      mantenimientoId: null,
      saludId: null,
    });
  }

  private getSectionTitle(key: CatalogKey): string {
    return this.catalogSections.find((section) => section.key === key)?.title ?? key;
  }

  private getFormByName(formName: 'plant' | 'tipo' | 'familia' | 'mantenimiento' | 'salud'): unknown {
    switch (formName) {
      case 'plant':
        return this.plantForm;
      case 'tipo':
        return this.tipoForm;
      case 'familia':
        return this.familiaForm;
      case 'mantenimiento':
        return this.mantenimientoForm;
      case 'salud':
        return this.saludForm;
    }
  }

  private showMessage(type: 'success' | 'error', text: string): void {
    this.message.set({ type, text });
    globalThis.setTimeout(() => {
      if (this.message()?.text === text) {
        this.message.set(null);
      }
    }, 4500);
  }

  private handleError(prefix: string, error: unknown): void {
    const detail = this.extractErrorMessage(error);
    this.showMessage('error', `${prefix} ${detail}`);
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }

      if (error.error?.message) {
        return error.error.message;
      }

      return error.message || 'Error HTTP inesperado.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Ocurrió un error inesperado.';
  }
}
