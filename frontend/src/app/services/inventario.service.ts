import { Injectable } from '@angular/core';
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
  fuente?: 'ai' | 'manual';
}

export interface Categoria {
  id: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(
    private supabase: SupabaseService,
    private refrigeradorService: RefrigeradorService
  ) {}

  /**
   * Obtiene los datos sin procesar de la vista v_inventory_current
   */
  async getInventory() {
    const { data, error } = await this.supabase.client
      .from('v_inventory_current')
      .select('*');

    if (error) {
      console.error('Error obteniendo inventario:', error);
      throw error;
    }

    return data;
  }

  /**
   * Obtiene y mapea los productos desde Supabase formateados para la UI
   */
  async getProductos(refrigeratorId?: string): Promise<ProductoInventario[]> {
    let query = this.supabase.client
      .from('v_inventory_current')
      .select('*');

    if (refrigeratorId) {
      query = query.eq('refrigerator_id', refrigeratorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener productos desde Supabase:', error);
      return [];
    }

    return (data || []).map((item: any) => {
      let estadoUI: 'critical' | 'soon' | 'fresh' = 'fresh';
      let etiqueta = 'FRESH';

      if (item.status === 'caducado' || item.status === 'agotado') {
        estadoUI = 'critical';
        etiqueta = 'CRITICAL';
      } else if (item.status === 'proximo_a_caducar' || item.status === 'bajo') {
        estadoUI = 'soon';
        etiqueta = 'SOON';
      }

      return {
        id: item.id,
        nombre: item.product_name ?? 'Producto',
        cantidad: `${item.quantity ?? 0} ${item.unit ?? ''}`.trim(),
        categoria: item.category_name ? item.category_name.toLowerCase() : 'otros',
        estado: estadoUI,
        etiquetaEstado: etiqueta,
        vencimiento: item.expires_on ? `Exp: ${item.expires_on}` : 'Sin fecha',
        imagen: item.product_image_path || item.image_path || 'assets/images/products/default-product.png',
        fuente: item.source === 'ai' ? 'ai' : 'manual'
      };
    });
  }

  /**
   * Obtiene las categorías configuradas en la BD para las pastillas de filtro
   */
  async getCategorias(): Promise<Categoria[]> {
    const { data, error } = await this.supabase.client
      .from('product_categories')
      .select('id, name, slug');

    if (error) {
      console.error('Error al obtener categorías:', error);
      return [{ id: 'todos', nombre: 'Todos' }];
    }

    const categoriasList: Categoria[] = [{ id: 'todos', nombre: 'Todos' }];
    (data || []).forEach((cat: any) => {
      categoriasList.push({
        id: cat.slug || cat.name.toLowerCase(),
        nombre: cat.name
      });
    });

    return categoriasList;
  }

  /**
   * Elimina un producto de la tabla inventory_items
   */
  async eliminarProducto(id: string): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar producto de Supabase:', error);
      return false;
    }

    return true;
  }

  /**
   * Alias de eliminarProducto para dar soporte a llamadas deleteItem()
   */
  async deleteItem(id: string): Promise<boolean> {
    return this.eliminarProducto(id);
  }

  /**
   * Conteo de estados para métricas/dashboard
   */
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

  /**
   * Top productos con mayor cantidad
   */
  async getTopProducts(limit = 5): Promise<Array<{ name: string; quantity: number }>> {
    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('quantity, product:products(name)')
      .order('quantity', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      name: row.product?.name ?? 'Sin nombre',
      quantity: Number(row.quantity ?? 0)
    }));
  }

  /**
   * Agrega un nuevo producto a Supabase (crea el producto base si no existe y luego lo inserta en el inventario)
   */
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
      // Ignorar si no existe
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

    const fridge = await this.refrigeradorService.getMiRefrigerador();
    if (!fridge) throw new Error('No se encontró un refrigerador activo.');

    const { data: userRes } = await client.auth.getUser();
    const user = (userRes as any)?.user ?? null;

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