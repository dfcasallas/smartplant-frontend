import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AgregarInventarioRequest, InventarioResponse } from '../models/smartplants.models';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  getInventarioPorUsuario(usuarioId: number): Observable<InventarioResponse[]> {
    return this.http.get<InventarioResponse[]>(`${this.baseUrl}/usuarios/${usuarioId}/inventario`);
  }

  agregarPlanta(usuarioId: number, request: AgregarInventarioRequest): Observable<InventarioResponse> {
    return this.http.post<InventarioResponse>(`${this.baseUrl}/usuarios/${usuarioId}/inventario`, request);
  }

  getInventarioPorId(inventarioId: number): Observable<InventarioResponse> {
    return this.http.get<InventarioResponse>(`${this.baseUrl}/inventario/${inventarioId}`);
  }
}
