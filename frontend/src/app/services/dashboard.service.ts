import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { RefrigeradorService } from './refrigerador.service';

export interface WeeklyTrendItem {
  day: string;
  count: number;
}

export interface DeviceStatus {
  id: string;
  type: string;
  name: string;
  status: string;
  ip_address?: string;
  firmware?: string;
  uptime_seconds?: number;
  wifi_rssi?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private supabase: SupabaseService, private refrigeradorService: RefrigeradorService) {}

  /**
   * Obtiene el resumen consolidado del refrigerador desde v_dashboard_summary
   */
  async getSummary() {
    const { data, error } = await this.supabase.client
      .from('v_dashboard_summary')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error al obtener v_dashboard_summary:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtiene los productos realmente próximos a caducar o caducados desde v_inventory_current
   */
  async getExpiringProducts(limit = 5) {
    const { data, error } = await this.supabase.client
      .from('v_inventory_current')
      .select('*')
      .or('status.eq.proximo_a_caducar,status.eq.caducado')
      .order('expires_on', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error al obtener productos por vencer:', error);
      return [];
    }

    return data;
  }

  async getCompletedScanCount(): Promise<number> {
    const { count, error } = await this.supabase.client
      .from('scans')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (error) throw error;
    return count ?? 0;
  }

  async getAverageFridgeTemperature(): Promise<number> {
    const { data, error } = await this.supabase.client
      .from('refrigerators')
      .select('temperature_min_c, temperature_max_c')
      .limit(1)
      .single();

    if (error) throw error;
    const fridge = data as any;
    if (!fridge) return 0;

    const minTemp = Number(fridge.temperature_min_c ?? 0);
    const maxTemp = Number(fridge.temperature_max_c ?? 0);
    return Number.isFinite(minTemp) && Number.isFinite(maxTemp)
      ? (minTemp + maxTemp) / 2
      : 0;
  }

  async getSavingsEstimate(): Promise<number> {
    const { data, error } = await this.supabase.client
      .from('inventory_items')
      .select('quantity');

    if (error) throw error;
    const items = (data ?? []) as Array<{ quantity?: string | number }>;
    return items.reduce((sum, item) => {
      const quantity = Number(item.quantity ?? 0);
      return sum + (Number.isFinite(quantity) ? quantity * 3.5 : 0);
    }, 0);
  }

  async getWeeklyScanTrend(days = 7): Promise<WeeklyTrendItem[]> {
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const { data, error } = await this.supabase.client
      .from('scans')
      .select('started_at')
      .gte('started_at', start.toISOString())
      .eq('status', 'completed');

    if (error) throw error;

    const counts: Record<string, number> = {};
    const labels: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const label = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      labels.push(label);
      counts[label] = 0;
    }

    (data ?? []).forEach((row: any) => {
      const date = new Date(row.started_at);
      const label = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
      if (counts[label] !== undefined) {
        counts[label] += 1;
      }
    });

    return labels.map(day => ({ day, count: counts[day] }));
  }

  async getDeviceStatuses(): Promise<DeviceStatus[]> {
    const { data, error } = await this.supabase.client
      .from('devices')
      .select('id, type, name, status, ip_address, firmware, uptime_seconds, wifi_rssi');

    if (error) throw error;
    return (data ?? []) as DeviceStatus[];
  }

  async checkSupabaseHealth(): Promise<boolean> {
    const { error } = await this.supabase.client
      .from('refrigerators')
      .select('id')
      .limit(1);

    return !error;
  }

  async getInventoryDistribution() {
    const fridge = await this.refrigeradorService.getMiRefrigerador();
    if (!fridge) return [];

    const { data, error } = await this.supabase.client
      .from('v_inventory_current')
      .select('category_name, product_name, quantity')
      .eq('refrigerator_id', fridge.id);

    if (error) return [];
    return data;
  }
}