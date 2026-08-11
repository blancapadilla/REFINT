import { Injectable } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

export type ScanStatus =
  | 'pending'
  | 'capturing'
  | 'processing'
  | 'awaiting_confirmation'
  | 'completed'
  | 'failed';

export type ScanChangeType =
  | 'added'
  | 'removed'
  | 'quantity_changed'
  | 'unchanged';

export interface Scan {
  id: string;
  refrigerator_id: string;
  camera_device_id: string | null;
  started_at: string;
  finished_at: string | null;
  status: ScanStatus;
  original_image_path: string | null;
  processed_image_path: string | null;
  detected_product_count: number;
  error_message: string | null;
  processing_ms: number | null;
  scan_type: string | null;
  initiated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  ai_label: string | null;
  image_path: string | null;
  default_unit?: string | null;
  is_ai_detectable?: boolean;
}

export interface ScanChange {
  id: string;
  scan_id: string;
  product_id: string;
  previous_quantity: number;
  new_quantity: number;
  difference: number;
  unit: string;
  change_type: ScanChangeType;
  confirmation_status: string;
  created_at?: string;
  products: Product | null;
}

export interface InventarioSyncItem {
  product_id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  estado: 'faltante' | 'agotado' | 'caducado';
  imagen: string | null;

  // Se agrega para poder considerar productos próximos
  // a caducar o ya caducados.
  expires_on?: string | null;
  days_to_expiry?: number | null;
}

export interface ResumenInventario {
  disponible: number;
  faltantes: number;
  agotados: number;
  caducados: number;
  total: number;
  porcentaje: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor( private readonly supabaseService: SupabaseService ) {}

  // ==========================================================
  // OBTENER ÚLTIMO ESCANEO
  // ==========================================================

  async getLatestCompletedScan(
    refrigeratorId: string
  ): Promise<Scan | null> {

    const { data, error } =
      await this.supabaseService.client
        .from('scans')
        .select(`
          id,
          refrigerator_id,
          camera_device_id,
          started_at,
          finished_at,
          status,
          original_image_path,
          processed_image_path,
          detected_product_count,
          error_message,
          processing_ms,
          scan_type,
          initiated_by,
          created_at,
          updated_at
        `)
        .eq('refrigerator_id', refrigeratorId)
        .eq('status', 'completed')
        .order('created_at', {
          ascending: false
        })
        .limit(1)
        .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as Scan | null) ?? null;
  }


  // ==========================================================
  // OBTENER CAMBIOS DEL ESCANEO
  // ==========================================================

  async getScanChanges(
    scanId: string
  ): Promise<ScanChange[]> {

    const { data, error } =
      await this.supabaseService.client
        .from('scan_changes')
        .select(`
          id,
          scan_id,
          product_id,
          previous_quantity,
          new_quantity,
          difference,
          unit,
          change_type,
          confirmation_status,
          created_at,
          products (
            id,
            name,
            brand,
            image_path,
            ai_label
          )
        `)
        .eq('scan_id', scanId)
        .order('created_at', {
          ascending: true
        });

    if (error) {
      throw error;
    }

    return (data ?? []) as unknown as ScanChange[];
  }


  // ==========================================================
  // OBTENER INVENTARIO CRÍTICO
  // ==========================================================

 async getInventarioCritico(refrigeratorId: string): Promise<InventarioSyncItem[]> {
    const { data, error } = await this.supabaseService.client
      .from('v_inventory_current')
      .select('*')
      .eq('refrigerator_id', refrigeratorId);

    if (error) {
      console.error('Error obteniendo inventario crítico:', error);
      throw error;
    }

    const productos: InventarioSyncItem[] = [];

    (data ?? []).forEach((item: any) => {
      const cantidad = Number(item.quantity ?? 0);
      const dias = item.days_to_expiry != null ? Number(item.days_to_expiry) : null;
      const status = String(item.status ?? '').toLowerCase();

      let estado: 'faltante' | 'agotado' | 'caducado' | null = null;

      // 1. CADUCADO (Fecha pasada)
      if (status === 'caducado' || (dias !== null && dias < 0)) {
        estado = 'caducado';
      }
      // 2. AGOTADO (Cantidad 0)
      else if (status === 'agotado' || cantidad <= 0) {
        estado = 'agotado';
      }
      // 3. FALTANTE / POR VENCER (Stock bajo o vence en 0-3 días)
      else if (status === 'bajo' || status === 'proximo_a_caducar' || (dias !== null && dias <= 3)) {
        estado = 'faltante';
      }

      if (!estado) return;

      productos.push({
        product_id: item.product_id,
        nombre: item.product_name ?? 'Producto',
        cantidad,
        unidad: item.unit ?? 'unidad',
        estado,
        imagen: item.product_image_path || item.image_path || null,
        expires_on: item.expires_on ?? null,
        days_to_expiry: dias
      });
    });

    return productos;
  }


  // ==========================================================
  // RESUMEN DEL INVENTARIO
  // ==========================================================

async getResumenInventario(refrigeratorId: string): Promise<ResumenInventario> {
    const { data, error } = await this.supabaseService.client
      .from('v_inventory_current')
      .select('*')
      .eq('refrigerator_id', refrigeratorId);

    if (error) throw error;

    let disponible = 0;
    let faltantes = 0;
    let agotados = 0;
    let caducados = 0;

    (data ?? []).forEach((item: any) => {
      const cantidad = Number(item.quantity ?? 0);
      const dias = item.days_to_expiry != null ? Number(item.days_to_expiry) : null;
      const status = String(item.status ?? '').toLowerCase();

      if (status === 'caducado' || (dias !== null && dias < 0)) {
        caducados++;
      } else if (status === 'agotado' || cantidad <= 0) {
        agotados++;
      } else if (status === 'bajo' || status === 'proximo_a_caducar' || (dias !== null && dias <= 3)) {
        faltantes++;
      } else {
        disponible++;
      }
    });

    const total = disponible + faltantes + agotados + caducados;
    const porcentaje = total > 0 ? Math.round((disponible / total) * 100) : 0;

    return {
      disponible,
      faltantes,
      agotados,
      caducados,
      total,
      porcentaje
    };
  }


  // ==========================================================
  // ACTUALIZAR SHOPPING LIST
  // ==========================================================

  async actualizarShoppingList(
    productos: InventarioSyncItem[]
  ): Promise<void> {

    if (!productos.length) {
      return;
    }


    // --------------------------------------------------------
    // BUSCAR LISTA ACTIVA
    // --------------------------------------------------------

    const {
      data: listas,
      error: listaError
    } =
      await this.supabaseService.client
        .from('shopping_lists')
        .select(`
          id,
          refrigerator_id
        `)
        .eq('status', 'active')
        .order('created_at', {
          ascending: false
        })
        .limit(1);


    if (listaError) {
      throw listaError;
    }


    if (
      !listas ||
      listas.length === 0
    ) {

      throw new Error(
        'No existe una lista de compras activa.'
      );
    }


    const shoppingListId =
      listas[0].id;


    // --------------------------------------------------------
    // AGREGAR CADA PRODUCTO
    // --------------------------------------------------------

    for (
      const producto of productos
    ) {

      const {
        data: existente,
        error: existenteError
      } =
        await this.supabaseService.client
          .from('shopping_list_items')
          .select(`
            id,
            desired_quantity
          `)
          .eq(
            'shopping_list_id',
            shoppingListId
          )
          .eq(
            'product_id',
            producto.product_id
          )
          .maybeSingle();


      if (existenteError) {
        throw existenteError;
      }


      // ------------------------------------------------------
      // SI YA EXISTE
      // ------------------------------------------------------

      if (existente) {

        const cantidadActual =
          Number(
            existente.desired_quantity ?? 0
          );


        const cantidadNueva =
          Math.max(
            cantidadActual,
            producto.cantidad
          );


        const {
          error: updateError
        } =
          await this.supabaseService.client
            .from('shopping_list_items')
            .update({

              desired_quantity:
                cantidadNueva,

              is_auto_generated:
                true,

              is_purchased:
                false,

              updated_at:
                new Date().toISOString()

            })
            .eq(
              'id',
              existente.id
            );


        if (updateError) {
          throw updateError;
        }

      }


      // ------------------------------------------------------
      // SI NO EXISTE
      // ------------------------------------------------------

      else {

        const {
          error: insertError
        } =
          await this.supabaseService.client
            .from('shopping_list_items')
            .insert({

              shopping_list_id:
                shoppingListId,

              product_id:
                producto.product_id,

              desired_quantity:
                Math.max(
                  producto.cantidad,
                  1
                ),

              unit:
                producto.unidad ||
                'unidad',

              is_purchased:
                false,

              is_auto_generated:
                true

            });


        if (insertError) {
          throw insertError;
        }

      }

    }

  }


  // ==========================================================
  // APLICAR CAMBIOS DEL ESCANEO
  // ==========================================================

  async applyScanChanges(
    scanId: string
  ): Promise<void> {

    const { error } =
      await this.supabaseService.client
        .rpc(
          'apply_scan_changes',
          {
            p_scan_id:
              scanId
          }
        );


    if (error) {
      throw error;
    }

  }


  // ==========================================================
  // REALTIME
  // ==========================================================

  subscribeToCompletedScans(
    refrigeratorId: string,
    onCompleted: () => void
  ): RealtimeChannel {

    return this.supabaseService.client

      .channel(
        `completed-scans:${refrigeratorId}`
      )

      .on(
        'postgres_changes',
        {

          event: '*',

          schema: 'public',

          table: 'scans',

          filter:
            `refrigerator_id=eq.${refrigeratorId}`

        },

        (payload: any) => {

          const scan =
            payload.new as Partial<Scan>;


          if (
            scan.status === 'completed'
          ) {

            onCompleted();

          }

        }

      )

      .subscribe();

  }


  // ==========================================================
  // DESUSCRIBIR
  // ==========================================================

  async unsubscribe(
    channel: RealtimeChannel
  ): Promise<void> {

    await this.supabaseService.client
      .removeChannel(channel);

  }

}