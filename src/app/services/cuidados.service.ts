import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CuidadoPlantaResponse, RegistrarCuidadoRequest } from '../models/smartplants.models';

@Injectable({ providedIn: 'root' })
export class CuidadosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  registrar(inventarioId: number, request: RegistrarCuidadoRequest): Observable<CuidadoPlantaResponse> {
    return this.http.post<CuidadoPlantaResponse>(`${this.baseUrl}/inventario/${inventarioId}/cuidados`, request);
  }

  listarPorInventario(inventarioId: number): Observable<CuidadoPlantaResponse[]> {
    return this.http.get<CuidadoPlantaResponse[]>(`${this.baseUrl}/inventario/${inventarioId}/cuidados`);
  }
}
