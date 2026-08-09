import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupabaseService } from './supabase';
import { RefrigeradorService } from './refrigerador.service';

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

  constructor(
    private http: HttpClient,
    private supabase: SupabaseService,
    private refrigeradorService: RefrigeradorService
  ) {}

  getProductos(): Observable<ProductoInventario[]> {
    return this.http.get<ProductoInventario[]>(this.apiUrl);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }

  async getInventoryStatusCounts(): Promise<{ fresh: number; soon: number; critical: number; expired: number; total: number }> {
    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('status');

    if (error) throw error;

    const rows = (data ?? []) as Array<{ status: string }>;
    const counts = { fresh: 0, soon: 0, critical: 0, expired: 0, total: rows.length };
    rows.forEach(row => {
      if (row.status === 'disponible') counts.fresh += 1;
      if (row.status === 'proximo_a_caducar' || row.status === 'bajo') counts.soon += 1;
      if (row.status === 'agotado') counts.critical += 1;
      if (row.status === 'caducado') counts.expired += 1;
    });
    return counts;
  }

  async getTopProducts(limit = 5): Promise<Array<{ name: string; quantity: number }>> {
    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('quantity, product(name)')
      .order('quantity', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      name: row.product?.name ?? 'Sin nombre',
      quantity: Number(row.quantity ?? 0)
    }));
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  async addProducto(payload: {
    nombre: string;
    marca?: string;
    categoria?: string;
    cantidad?: number;
    unidad?: string;
    fechaVencimiento?: string;
    notas?: string;
  }): Promise<any> {
    const client = this.supabase.client;

    // 1) Buscar o crear producto en `products`
    const name = (payload.nombre || '').trim();
    const brand = payload.marca && payload.marca.trim().length ? payload.marca.trim() : null;

    let productId: string | null = null;

    try {
      const { data: existing } = await client
        .from('products')
        .select('id')
        .match({ name, brand })
        .limit(1)
        .single();

      if (existing && (existing as any).id) {
        productId = (existing as any).id;
      }
    } catch (e) {
      // ignore not found
    }

    if (!productId) {
      const { data, error } = await client
        .from('products')
        .insert({ name, brand, default_unit: payload.unidad || 'unidad' })
        .select('id')
        .limit(1)
        .single();

      if (error) throw error;
      productId = (data as any).id;
    }

    // 2) Obtener refrigerador activo
    const fridge = await this.refrigeradorService.getMiRefrigerador();
    if (!fridge) throw new Error('No se encontró un refrigerador activo.');

    // 3) Obtener usuario actual (si existe)
    const { data: userRes } = await client.auth.getUser();
    const user = (userRes as any)?.user ?? null;

    // 4) Insertar en inventory_items
    const { data, error } = await client
      .from('inventory_items')
      .insert({
        refrigerator_id: fridge.id,
        product_id: productId,
        quantity: payload.cantidad ?? 1,
        unit: payload.unidad || 'unidad',
        expires_on: payload.fechaVencimiento || null,
        source: 'manual',
        image_path: null,
        created_by: user?.id ?? null
      })
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    return data;
  }
}