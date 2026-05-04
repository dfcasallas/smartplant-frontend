import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CatalogItem,
  CatalogoResponse,
  Familia,
  FamiliaRequest,
  MantenimientoRequest,
  Mantenimiento,
  Planta,
  PlantaRequest,
  Salud,
  SaludRequest,
  Tipo,
  TipoRequest,
} from '../models/smartplants.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getTipos(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(`${this.baseUrl}/tipos`);
  }

  createTipo(payload: TipoRequest): Observable<Tipo> {
    return this.http.post<Tipo>(`${this.baseUrl}/tipos`, payload);
  }

  updateTipo(id: number, payload: TipoRequest): Observable<Tipo> {
    return this.http.put<Tipo>(`${this.baseUrl}/tipos/${id}`, payload);
  }

  deleteTipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tipos/${id}`);
  }

  getFamilias(): Observable<Familia[]> {
    return this.http.get<Familia[]>(`${this.baseUrl}/familias`);
  }

  createFamilia(payload: FamiliaRequest): Observable<Familia> {
    return this.http.post<Familia>(`${this.baseUrl}/familias`, payload);
  }

  updateFamilia(id: number, payload: FamiliaRequest): Observable<Familia> {
    return this.http.put<Familia>(`${this.baseUrl}/familias/${id}`, payload);
  }

  deleteFamilia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/familias/${id}`);
  }

  getMantenimientos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.baseUrl}/mantenimientos`);
  }

  createMantenimiento(payload: MantenimientoRequest): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(`${this.baseUrl}/mantenimientos`, payload);
  }

  updateMantenimiento(id: number, payload: MantenimientoRequest): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.baseUrl}/mantenimientos/${id}`, payload);
  }

  deleteMantenimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/mantenimientos/${id}`);
  }

  getSaludes(): Observable<Salud[]> {
    return this.http.get<Salud[]>(`${this.baseUrl}/saludes`);
  }

  createSalud(payload: SaludRequest): Observable<Salud> {
    return this.http.post<Salud>(`${this.baseUrl}/saludes`, payload);
  }

  updateSalud(id: number, payload: SaludRequest): Observable<Salud> {
    return this.http.put<Salud>(`${this.baseUrl}/saludes/${id}`, payload);
  }

  deleteSalud(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/saludes/${id}`);
  }

  getPlantas(): Observable<Planta[]> {
    return this.http.get<Planta[]>(`${this.baseUrl}/plantas`);
  }

  createPlanta(payload: PlantaRequest): Observable<Planta> {
    return this.http.post<Planta>(`${this.baseUrl}/plantas`, payload);
  }

  updatePlanta(id: number, payload: PlantaRequest): Observable<Planta> {
    return this.http.put<Planta>(`${this.baseUrl}/plantas/${id}`, payload);
  }

  deletePlanta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/plantas/${id}`);
  }

  getCatalogLabel(item: CatalogItem | CatalogoResponse): string {
    return item.valor;
  }
}
