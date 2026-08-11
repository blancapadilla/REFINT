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

    const { error } = await this.supabase.client
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(
        'Error al eliminar producto de Supabase:',
        error
      );
      return false;
    }

    // Actualiza el estado reactivo inmediatamente
    await this.refrescarProductos();
    return true;
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
}