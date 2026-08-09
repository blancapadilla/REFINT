import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoInventario {
  id: string;
  nombre: string;
  cantidad: string;
  categoria: string;
  estado: 'critical' | 'soon' | 'fresh';
  etiquetaEstado: string;
  vencimiento: string;
  imagen: string;
}

export interface Categoria {
  id: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:8000/api/v1/inventario';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(this.apiUrl);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}