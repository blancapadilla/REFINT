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

@Injectable({ providedIn: 'root' })
export class HistorialService {
  constructor(private supabaseService: SupabaseService) {}

  async getActividades(): Promise<{ hoy: ActivityItem[]; ayer: ActivityItem[]; resto: ActivityItem[] }> {
    const { data, error } = await this.supabaseService.client
      .from('v_activity_feed')
      .select('*')
      .order('event_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);

    const mapeado = (data ?? []).map((row: any): ActivityItem => ({
      title: row.title ?? '',
      description: row.description ?? '',
      time: new Date(row.event_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(row.event_at),
      icon: this.iconParaTipo(row.activity_type, row.severity),
      color: this.colorParaSeveridad(row.severity, row.activity_type)
    }));

    return {
      hoy:   mapeado.filter(a => a.date >= hoy),
      ayer:  mapeado.filter(a => a.date >= ayer && a.date < hoy),
      resto: mapeado.filter(a => a.date < ayer)
    };
  }

  async getEscaneos(): Promise<ScanItem[]> {
    const { data, error } = await this.supabaseService.client
      .from('v_scan_history')
      .select('*')
      .eq('status', 'completed')
      .order('finished_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data ?? []).map((row: any): ScanItem => ({
      fecha: this.formatearFechaScan(row.finished_at ?? row.started_at),
      productos: row.detected_product_count ?? 0,
      agregados: row.products_added ?? 0,
      retirados: row.products_removed ?? 0,
      modificados: row.products_modified ?? 0
    }));
  }

  private formatearFechaScan(iso: string): string {
    const d = new Date(iso);
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ayer = new Date(hoy); ayer.setDate(ayer.getDate() - 1);
    const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    if (d >= hoy)  return `Hoy, ${hora}`;
    if (d >= ayer) return `Ayer, ${hora}`;
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + `, ${hora}`;
  }

  private iconParaTipo(tipo: string, severity: string | null): string {
    if (tipo === 'alert') return severity === 'critical' ? 'alert-circle-outline' : 'notifications-outline';
    if (tipo === 'scan')  return 'camera-outline';
    return 'cube-outline';
  }

  private colorParaSeveridad(severity: string | null, tipo: string): 'danger' | 'primary' | 'gray' {
    if (severity === 'critical' || severity === 'warning') return 'danger';
    if (tipo === 'scan') return 'gray';
    return 'primary';
  }
}
