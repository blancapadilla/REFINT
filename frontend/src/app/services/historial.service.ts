import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: 'danger' | 'primary' | 'gray';
  date: Date;
}

export interface ScanItem {
  fecha: string;
  productos: number;
  agregados: number;
  retirados: number;
  modificados: number;
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(
    private supabaseService: SupabaseService
  ) {}

  // =========================================================
  // OBTENER REFRIGERADORES DEL USUARIO ACTUAL
  // =========================================================
  private async obtenerRefrigeradoresUsuario(): Promise<string[]> {

    const { data: userData, error: userError } =
      await this.supabaseService.client.auth.getUser();

    if (userError) {
      throw userError;
    }

    const usuario = userData.user;

    console.log('USUARIO ACTUAL:', usuario);

    if (!usuario) {
      throw new Error('No hay un usuario iniciado sesión.');
    }

    const { data: refrigeradores, error } =
      await this.supabaseService.client
        .from('refrigerators')
        .select('id')
        .eq('owner_id', usuario.id);

    if (error) {
      throw error;
    }

    console.log('REFRIGERADORES DEL USUARIO:', refrigeradores);

    const ids = (refrigeradores ?? []).map(
      (refrigerador: any) => refrigerador.id
    );

    console.log('IDS DE REFRIGERADORES PARA HISTORIAL:', ids);

    return ids;
  }


  // =========================================================
  // ACTIVIDADES
  // =========================================================
  async getActividades(): Promise<{
    hoy: ActivityItem[];
    ayer: ActivityItem[];
    resto: ActivityItem[];
  }> {

    const refrigeratorIds =
      await this.obtenerRefrigeradoresUsuario();

    if (refrigeratorIds.length === 0) {
      return {
        hoy: [],
        ayer: [],
        resto: []
      };
    }

    const { data, error } =
      await this.supabaseService.client
        .from('v_activity_feed')
        .select('*')
        .in('refrigerator_id', refrigeratorIds)
        .order('event_at', {
          ascending: false
        })
        .limit(50);

    if (error) {
      throw error;
    }

    console.log('ACTIVIDADES RECIBIDAS DE SUPABASE:', data);


    const ahora = new Date();

    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );

    const ayer = new Date(hoy);

    ayer.setDate(
      ayer.getDate() - 1
    );


    const mapeado = (data ?? []).map(
      (row: any): ActivityItem => ({

        title: row.title ?? '',

        description: row.description ?? '',

        time: new Date(
          row.event_at
        ).toLocaleTimeString(
          'es-MX',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

        date: new Date(
          row.event_at
        ),

        icon: this.iconParaTipo(
          row.activity_type,
          row.severity
        ),

        color: this.colorParaSeveridad(
          row.severity,
          row.activity_type
        )

      })
    );


    return {

      hoy: mapeado.filter(
        actividad =>
          actividad.date >= hoy
      ),

      ayer: mapeado.filter(
        actividad =>
          actividad.date >= ayer &&
          actividad.date < hoy
      ),

      resto: mapeado.filter(
        actividad =>
          actividad.date < ayer
      )

    };
  }


  // =========================================================
  // ESCANEOS
  // =========================================================
  async getEscaneos(): Promise<ScanItem[]> {

    const refrigeratorIds =
      await this.obtenerRefrigeradoresUsuario();

    console.log(
      'IDS DE REFRIGERADORES PARA ESCANEOS:',
      refrigeratorIds
    );

    if (refrigeratorIds.length === 0) {
      return [];
    }

    const { data, error } =
      await this.supabaseService.client
        .from('v_scan_history')
        .select('*')
        .in('refrigerator_id', refrigeratorIds)
        .eq('status', 'completed')
        .order('finished_at', {
          ascending: false
        })
        .limit(20);

    if (error) {
      throw error;
    }

    console.log(
      'ESCANEOS RECIBIDOS DE SUPABASE:',
      data
    );


    return (data ?? []).map(
      (row: any): ScanItem => ({

        fecha: this.formatearFechaScan(
          row.finished_at ??
          row.started_at
        ),

        productos:
          row.detected_product_count ?? 0,

        agregados:
          row.products_added ?? 0,

        retirados:
          row.products_removed ?? 0,

        modificados:
          row.products_modified ?? 0

      })
    );
  }


  // =========================================================
  // FORMATO DE FECHA DE ESCANEO
  // =========================================================
  private formatearFechaScan(
    iso: string
  ): string {

    const d = new Date(iso);

    const ahora = new Date();

    const hoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );

    const ayer = new Date(hoy);

    ayer.setDate(
      ayer.getDate() - 1
    );

    const hora =
      d.toLocaleTimeString(
        'es-MX',
        {
          hour: '2-digit',
          minute: '2-digit'
        }
      );


    if (d >= hoy) {

      return `Hoy, ${hora}`;

    }


    if (d >= ayer) {

      return `Ayer, ${hora}`;

    }


    return (
      d.toLocaleDateString(
        'es-MX',
        {
          day: 'numeric',
          month: 'short'
        }
      ) +
      `, ${hora}`
    );
  }


  // =========================================================
  // ICONO SEGÚN TIPO DE ACTIVIDAD
  // =========================================================
  private iconParaTipo(
    tipo: string,
    severity: string | null
  ): string {

    if (tipo === 'alert') {

      if (severity === 'critical') {
        return 'alert-circle-outline';
      }

      return 'notifications-outline';
    }


    if (tipo === 'scan') {

      return 'camera-outline';

    }


    return 'cube-outline';
  }


  // =========================================================
  // COLOR SEGÚN ACTIVIDAD
  // =========================================================
  private colorParaSeveridad(
    severity: string | null,
    tipo: string
  ): 'danger' | 'primary' | 'gray' {

    if (
      severity === 'critical' ||
      severity === 'warning'
    ) {

      return 'danger';

    }


    if (tipo === 'scan') {

      return 'gray';

    }


    return 'primary';
  }

}