import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { RefrigeradorService } from './refrigerador.service';
import { BehaviorSubject, Observable } from 'rxjs';

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

  // =========================================================
  // 1. ESTADO REACTIVO GLOBAL (RxJS BehaviorSubject)
  // =========================================================
  private productosSubject = new BehaviorSubject<ProductoInventario[]>([]);
  public productos$: Observable<ProductoInventario[]> = this.productosSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private refrigeradorService: RefrigeradorService
  ) {
    // Inicialización al arrancar el servicio
    this.refrescarProductos();
    this.activarRealtime();
  }

  // =========================================================
  // 2. SUPABASE REALTIME (Escucha en vivo de cambios)
  // =========================================================
  private activarRealtime(): void {
    this.supabase.client
      .channel('public:inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          console.log('⚡ Cambio en tiempo real detectado en Supabase:', payload);
          // Refresca el estado reactivo cuando Python, el ESP32 o la app modifiquen items
          this.refrescarProductos();
        }
      )
      .subscribe();
  }

  /**
   * Carga los productos desde Supabase y actualiza el BehaviorSubject
   */
  async refrescarProductos(refrigeratorId?: string): Promise<ProductoInventario[]> {
    const productos = await this.getProductos(refrigeratorId);
    this.productosSubject.next(productos);
    return productos;
  }


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
   * Obtiene y mapea los productos desde Supabase
   * formateados para la interfaz
   */
  async getProductos(
    refrigeratorId?: string
  ): Promise<ProductoInventario[]> {

    let query = this.supabase.client
      .from('v_inventory_current')
      .select('*');

    if (refrigeratorId) {
      query = query.eq('refrigerator_id', refrigeratorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error(
        'Error al obtener productos desde Supabase:',
        error
      );
      return [];
    }

    return (data || []).map((item: any) => {

      let estadoUI: 'critical' | 'soon' | 'fresh' = 'fresh';
      let etiqueta = 'FRESH';

      if (
        item.status === 'caducado' ||
        item.status === 'agotado'
      ) {
        estadoUI = 'critical';
        etiqueta = 'CRITICAL';

      } else if (
        item.status === 'proximo_a_caducar' ||
        item.status === 'bajo'
      ) {
        estadoUI = 'soon';
        etiqueta = 'SOON';
      }

      return {
        id: item.id,

        nombre: item.product_name ?? 'Producto',

        cantidad:
          `${item.quantity ?? 0} ${item.unit ?? ''}`.trim(),

        categoria:
          item.category_name
            ? item.category_name.toLowerCase()
            : 'otros',

        estado: estadoUI,

        etiquetaEstado: etiqueta,

        vencimiento:
          item.expires_on
            ? `Exp: ${item.expires_on}`
            : 'Sin fecha',

        imagen:
          item.product_image_path ||
          item.image_path ||
          'assets/images/products/default-product.png',

        fuente:
          item.source === 'ai'
            ? 'ai'
            : 'manual'
      };
    });
  }


  /**
   * Obtiene las categorías configuradas en la BD
   * para las pastillas de filtro.
   */
  async getCategorias(): Promise<Categoria[]> {

    const { data, error } = await this.supabase.client
      .from('product_categories')
      .select('id, name, slug');

    if (error) {
      console.error(
        'Error al obtener categorías:',
        error
      );

      return [
        {
          id: 'todos',
          nombre: 'Todos'
        }
      ];
    }

    const categoriasList: Categoria[] = [
      {
        id: 'todos',
        nombre: 'Todos'
      }
    ];

    (data || []).forEach((cat: any) => {
      categoriasList.push({
        id: cat.slug || cat.name.toLowerCase(),
        nombre: cat.name
      });
    });

    return categoriasList;
  }


  /**
   * Elimina un producto de inventory_items.
   */
 async eliminarProducto(id: string): Promise<boolean> {
    try {
      // Como ya quitamos la restricción en la base de datos, 
      // podemos eliminar el producto directamente y sin bloqueos.
      const { error } = await this.supabase.client
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar producto de Supabase:', error);
        return false;
      }

      // Actualizamos toda la app (Dashboard, Estadísticas, Inventario)
      await this.refrescarProductos();
      return true;

    } catch (err) {
      console.error('Error interno al eliminar:', err);
      return false;
    }
  }


  /**
   * Alias de eliminarProducto
   */
  async deleteItem(id: string): Promise<boolean> {
    return this.eliminarProducto(id);
  }


  /**
   * Conteo de estados para métricas/dashboard.
   */
  async getInventoryStatusCounts(): Promise<{
    fresh: number;
    soon: number;
    critical: number;
    expired: number;
    total: number;
  }> {

    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('status');

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as Array<{ status: string }>;

    const counts = {
      fresh: 0,
      soon: 0,
      critical: 0,
      expired: 0,
      total: rows.length
    };

    rows.forEach(row => {
      if (row.status === 'disponible') {
        counts.fresh++;
      }

      if (
        row.status === 'proximo_a_caducar' ||
        row.status === 'bajo'
      ) {
        counts.soon++;
      }

      if (row.status === 'agotado') {
        counts.critical++;
      }

      if (row.status === 'caducado') {
        counts.expired++;
      }
    });

    return counts;
  }


  /**
   * Obtiene los productos con mayor cantidad.
   */
  async getTopProducts(
    limit = 5
  ): Promise<Array<{
    name: string;
    quantity: number;
  }>> {

    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('quantity, product:products(name)')
      .order('quantity', {
        ascending: false
      })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row: any) => ({
      name: row.product?.name ?? 'Sin nombre',
      quantity: Number(row.quantity ?? 0)
    }));
  }


  /**
   * Agrega un nuevo producto a Supabase.
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

    // 1. VALIDAR NOMBRE
    const name = (payload.nombre || '').trim();

    if (!name) {
      throw new Error('El nombre del producto es obligatorio.');
    }

    // 2. OBTENER MARCA
    const brand =
      payload.marca && payload.marca.trim().length > 0
        ? payload.marca.trim()
        : null;

    // 3. BUSCAR SI EL PRODUCTO YA EXISTE
    let productId: string | null = null;

    let existingQuery = client
      .from('products')
      .select('id')
      .eq('name', name);

    if (brand === null) {
      existingQuery = existingQuery.is('brand', null);
    } else {
      existingQuery = existingQuery.eq('brand', brand);
    }

    const { data: existingProduct, error: searchError } = await existingQuery
      .limit(1)
      .maybeSingle();

    if (searchError) {
      console.error('Error buscando producto:', searchError);
    }

    if (existingProduct) {
      productId = existingProduct.id;
    }

    // 4. CREAR PRODUCTO BASE SI NO EXISTE
    if (!productId) {
      const { data: newProduct, error: productError } = await client
        .from('products')
        .insert({
          name: name,
          brand: brand,
          default_unit: payload.unidad || 'unidad'
        })
        .select('id')
        .single();

      if (productError) {
        console.error('Error creando producto:', productError);
        throw productError;
      }

      productId = newProduct.id;
    }

    // 5. OBTENER REFRIGERADOR DEL USUARIO
    const fridge = await this.refrigeradorService.getMiRefrigerador();

    if (!fridge) {
      throw new Error('No se encontró un refrigerador activo para este usuario.');
    }

    // 6. OBTENER USUARIO ACTUAL
    const { data: userResponse, error: userError } = await client.auth.getUser();

    if (userError) {
      console.error('Error obteniendo usuario:', userError);
      throw userError;
    }

    const user = userResponse?.user;

    if (!user) {
      throw new Error('No hay un usuario autenticado.');
    }

    // 7. INSERTAR EN INVENTORY_ITEMS
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
        created_by: user.id
      })
      .select('*')
      .single();

    // 8. VALIDAR INSERCIÓN
    if (error) {
      console.error('Error guardando producto en inventory_items:', error);
      throw error;
    }

    // Actualiza el estado reactivo inmediatamente
    await this.refrescarProductos();

    return data;
  }

// =========================================================
  // ÍCONOS Y VECTORES BASADOS EN CATEGORÍAS DE ALIMENTOS
  // =========================================================
  // =========================================================
  // ÍCONOS Y VECTORES VECTORIALES LIMPIOS POR CATEGORÍA
  // =========================================================

//inventario.service.ts:
  obtenerImagenProducto(item: any): string {
    // 1. Si el producto tiene una URL real de imagen en Supabase Storage
    if (item.product_image_path && /^https?:\/\//i.test(item.product_image_path)) {
      return item.product_image_path;
    }
    if (item.image_path && /^https?:\/\//i.test(item.image_path)) {
      return item.image_path;
    }

    const catName = (item.category_name || item.categoria || '').toLowerCase();
    const prodName = (item.product_name || item.nombre || '').toLowerCase();

    // A. LÁCTEOS & HUEVOS (Cartón de leche)
    if (
      catName.includes('lacteo') || catName.includes('lácteo') || catName.includes('huevo') ||
      prodName.includes('leche') || prodName.includes('queso') || prodName.includes('yogurt') || prodName.includes('huevo') || prodName.includes('crema') || prodName.includes('mantequilla')
    ) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23dbeaff"/%3E%3Cpath fill="none" stroke="%230053db" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M8 2h8v3H8zM6 5h12l1 16H5zM6 11h12"/%3E%3C/svg%3E';
    }

    // B. VEGETALES Y FRUTAS (Hoja verde)
    if (
      catName.includes('vegetal') || catName.includes('fruta') || catName.includes('verdura') ||
      prodName.includes('tomate') || prodName.includes('espinaca') || prodName.includes('apio') || prodName.includes('platano') || prodName.includes('zanahoria') || prodName.includes('cebolla')
    ) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23dcfce7"/%3E%3Cpath fill="none" stroke="%2316a34a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.12 2 9a7 7 0 0 1-10 9zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/%3E%3C/svg%3E';
    }

    // C. CARNES & PROTEÍNAS (Pierna de pollo)
 if (
      catName.includes('carne') || catName.includes('protein') || catName.includes('proteín') ||
      prodName.includes('pollo') || prodName.includes('res') || prodName.includes('cerdo') || prodName.includes('pescado') || prodName.includes('jamon') || prodName.includes('salchicha')
    ) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23fee2e2"/%3E%3Cpath fill="none" stroke="%23dc2626" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M15 4a4.5 4.5 0 0 1 6.36 6.36l-4.24 4.24a6 6 0 0 1-7.5 1l-3.2 3.2a2 2 0 1 1-2.83-2.83l3.2-3.2a6 6 0 0 1 1-7.5z"/%3E%3Cpath fill="none" stroke="%23dc2626" stroke-width="1.8" stroke-linecap="round" d="M12 9.5a2.5 2.5 0 0 1 3.5 3.5"/%3E%3C/svg%3E';
    }
    
    // D. BEBIDAS (Gota de agua / Líquido)
    if (
      catName.includes('bebida') || catName.includes('jugo') || catName.includes('refresco') ||
      prodName.includes('agua') || prodName.includes('jugo') || prodName.includes('refresco') || prodName.includes('cerveza') || prodName.includes('te') || prodName.includes('cafe')
    ) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23e0f2fe"/%3E%3Cpath fill="none" stroke="%230284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/%3E%3C/svg%3E';
    }

    // E. CONGELADOS (Copo de nieve)
    if (
      catName.includes('congelado') || catName.includes('hielo') ||
      prodName.includes('hielo') || prodName.includes('helado') || prodName.includes('nieve')
    ) {
      return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23e0e7ff"/%3E%3Cpath fill="none" stroke="%234f46e5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M2 12h20M20 16l-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/%3E%3C/svg%3E';
    }

    // F. OTROS / SNACKS / CHIPS (Caja de producto / Paquete)
    return 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Crect width="24" height="24" rx="6" fill="%23f1f5f9"/%3E%3Cpath fill="none" stroke="%2364748b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96l8.73 5.05 8.73-5.05M12 22.08V12"/%3E%3C/svg%3E';
  }
}