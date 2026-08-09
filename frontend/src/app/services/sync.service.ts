import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenComparacion {
  disponible: number;
  faltante: number;
  agotado: number;
}

export interface FiltroCritico {
  id: string;
  nombre: string;
}

export interface ItemCritico {
  id: string;
  nombre: string;
  subtexto: string;
  estado: 'disponible' | 'faltante' | 'agotado';
  colorPlaceholder: '1' | '2' | '3';
  categoria_id: string;
}

export interface UsoInventario {
  frutas: number;
  lacteos: number;
  carnes: number;
  otros: number;
  lleno: number;
}

export interface ComparacionResponse {
  resumen: ResumenComparacion;
  filtrosCriticos: FiltroCritico[];
  itemsCriticos: ItemCritico[];
  articulosReposicion: string[];
  uso: UsoInventario;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private apiUrl = 'http://localhost:8000/api/v1/sync';

  constructor(private http: HttpClient) {}

  getComparacionData(): Observable<ComparacionResponse> {
    return this.http.get<ComparacionResponse>(this.apiUrl);
  }

  actualizarShoppingList(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/actualizar-shopping-list`, {});
  }
}