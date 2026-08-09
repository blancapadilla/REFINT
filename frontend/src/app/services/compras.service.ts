import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ItemBadge {
  texto: string;
  tipo: 'critico' | 'agotado';
}

export interface ItemCompra {
  id: string;
  nombre: string;
  marcado: boolean;
  badge?: ItemBadge;
}

export interface CategoriaCompra {
  id: string;
  nombre: string;
  icono: string;
  color: 'blue' | 'green' | 'teal';
  items: ItemCompra[];
}

export interface EstadisticasCompra {
  ahorro_proyectado: string;
  plan_optimizado: string;
}

export interface ShoppingListResponse {
  categorias: CategoriaCompra[];
  estadisticas: EstadisticasCompra;
}

@Injectable({
  providedIn: 'root'
})
export class ComprasService {
  private apiUrl = 'http://localhost:8000/api/v1/compras';

  constructor(private http: HttpClient) {}

  getListaCompras(): Observable<ShoppingListResponse> {
    return this.http.get<ShoppingListResponse>(this.apiUrl);
  }

  toggleItem(itemId: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/items/${itemId}/toggle`, {});
  }

  generarListaAutomatica(): Observable<ShoppingListResponse> {
    return this.http.post<ShoppingListResponse>(`${this.apiUrl}/generar-automatica`, {});
  }
}