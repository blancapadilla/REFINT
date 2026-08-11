import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface ItemBadge {
  texto: string;
  tipo: 'critico' | 'agotado';
}

export interface ItemCompra {
  id: string;
  nombre: string;
  marcado: boolean;
  badge?: ItemBadge;
  cantidad?: number;
  unidad?: string;
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

  constructor(private supabase: SupabaseService) {}

  async getListaCompras(): Promise<ShoppingListResponse> {

    // ==========================================
    // 1. Obtener la lista de compras activa
    // ==========================================

    const { data: listas, error: listaError } =
      await this.supabase.client
        .from('shopping_lists')
        .select('id, name, status')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

    if (listaError) {
      console.error('Error obteniendo lista de compras:', listaError);
      throw listaError;
    }

    if (!listas || listas.length === 0) {
      return {
        categorias: [],
        estadisticas: {
          ahorro_proyectado: '20%',
          plan_optimizado: 'Zero Waste'
        }
      };
    }

    const listaId = listas[0].id;

    // ==========================================
    // 2. Obtener productos de esa lista
    // ==========================================

    const { data: items, error: itemsError } =
      await this.supabase.client
        .from('shopping_list_items')
        .select(`
          id,
          desired_quantity,
          unit,
          is_purchased,
          is_auto_generated,
          product_id,
          products (
            id,
            name,
            category_id,
            product_categories (
              id,
              name
            )
          )
        `)
        .eq('shopping_list_id', listaId)
        .order('created_at', { ascending: true });

    if (itemsError) {
      console.error('Error obteniendo productos de la lista:', itemsError);
      throw itemsError;
    }

    // ==========================================
    // 3. Crear categorías para la pantalla
    // ==========================================

    const categoriasMap = new Map<string, CategoriaCompra>();

    (items ?? []).forEach((item: any) => {

      const producto = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      if (!producto) {
        return;
      }

      const categoriaBD =
        Array.isArray(producto.product_categories)
          ? producto.product_categories[0]
          : producto.product_categories;

      const nombreCategoria =
        categoriaBD?.name ?? 'Otros';

      const categoriaId =
        this.normalizarCategoria(nombreCategoria);

      if (!categoriasMap.has(categoriaId)) {

        categoriasMap.set(categoriaId, {
          id: categoriaId,
          nombre: nombreCategoria,
          icono: this.obtenerIcono(categoriaId),
          color: this.obtenerColor(categoriaId),
          items: []
        });

      }

      // ========================================
      // 4. Crear producto para la pantalla
      // ========================================

      const itemCompra: ItemCompra = {
        id: item.id,
        nombre: producto.name,
        marcado: item.is_purchased,
        cantidad: Number(item.desired_quantity ?? 1),
        unidad: item.unit
      };

      categoriasMap.get(categoriaId)!.items.push(itemCompra);
    });

    return {
      categorias: Array.from(categoriasMap.values()),
      estadisticas: {
        ahorro_proyectado: '20%',
        plan_optimizado: 'Zero Waste'
      }
    };
  }

  // ==========================================
  // MARCAR / DESMARCAR PRODUCTO
  // ==========================================

  async toggleItem(itemId: string): Promise<void> {

    // Primero obtenemos el estado actual

    const { data: item, error: getError } =
      await this.supabase.client
        .from('shopping_list_items')
        .select('is_purchased')
        .eq('id', itemId)
        .single();

    if (getError) {
      console.error('Error obteniendo producto:', getError);
      throw getError;
    }

    const nuevoEstado = !item.is_purchased;

    // Actualizar en Supabase

    const { error: updateError } =
      await this.supabase.client
        .from('shopping_list_items')
        .update({
          is_purchased: nuevoEstado
        })
        .eq('id', itemId);

    if (updateError) {
      console.error('Error actualizando producto:', updateError);
      throw updateError;
    }
  }

  // ==========================================
  // CATEGORÍA
  // ==========================================

  private normalizarCategoria(nombre: string): string {

    const texto = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (
      texto.includes('lacteo') ||
      texto.includes('huevo')
    ) {
      return 'lacteos';
    }

    if (
      texto.includes('vegetal') ||
      texto.includes('verdura')
    ) {
      return 'vegetales';
    }

    if (
      texto.includes('carne') ||
      texto.includes('proteina')
    ) {
      return 'carnes';
    }

    if (
      texto.includes('bebida') ||
      texto.includes('refresco') ||
      texto.includes('jugo')
    ) {
      return 'bebidas';
    }

    return 'otros';
  }

  // ==========================================
  // ICONO
  // ==========================================

  private obtenerIcono(categoria: string): string {

    switch (categoria) {

      case 'lacteos':
        return 'nutritionOutline';

      case 'vegetales':
        return 'leafOutline';

      case 'bebidas':
        return 'waterOutline';

      default:
        return 'leafOutline';
    }
  }

  // ==========================================
  // COLOR
  // ==========================================

  private obtenerColor(
    categoria: string
  ): 'blue' | 'green' | 'teal' {

    switch (categoria) {

      case 'lacteos':
        return 'blue';

      case 'vegetales':
        return 'green';

      default:
        return 'teal';
    }
  }

  // ==========================================
  // GENERAR LISTA AUTOMÁTICA
  // ==========================================

  async generarListaAutomatica(): Promise<void> {

    console.log(
      'La generación automática se realizará posteriormente.'
    );
  }

  // ==========================================
  // ELIMINAR PRODUCTO DE LA LISTA
  // ==========================================
  async eliminarItem(itemId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('shopping_list_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error eliminando item:', error);
      throw error;
    }
  }

  // ==========================================
  // AGREGAR PRODUCTO MANUAL A LA LISTA
  // ==========================================
  async agregarItemManual(nombreProducto: string): Promise<void> {
    // 1. Obtener la lista activa
    let { data: listas } = await this.supabase.client
      .from('shopping_lists')
      .select('id')
      .eq('status', 'active')
      .limit(1);

    // Si no hay lista activa, la protección de la BD requerirá crear una (asumiendo que ya hay una, tomamos el ID)
    if (!listas || listas.length === 0) throw new Error("No hay lista activa");
    const listaId = listas[0].id;

    // 2. Buscar si el producto ya existe en el catálogo global
    let productId: string;
    const { data: prodExistente } = await this.supabase.client
      .from('products')
      .select('id')
      .ilike('name', nombreProducto.trim())
      .limit(1)
      .maybeSingle();

    if (prodExistente) {
      productId = prodExistente.id;
    } else {
      // 3. Si no existe, lo creamos rápido en el catálogo de productos
      const { data: nuevoProd, error: prodErr } = await this.supabase.client
        .from('products')
        .insert({ name: nombreProducto.trim(), default_unit: 'unidad' })
        .select('id')
        .single();
      
      if (prodErr) throw prodErr;
      productId = nuevoProd.id;
    }

    // 4. Agregarlo a la lista de compras
    const { error: insertErr } = await this.supabase.client
      .from('shopping_list_items')
      .insert({
        shopping_list_id: listaId,
        product_id: productId,
        desired_quantity: 1,
        is_auto_generated: false
      });

    if (insertErr) throw insertErr;
  }
}