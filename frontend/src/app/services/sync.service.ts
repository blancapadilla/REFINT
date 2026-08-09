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

export type ScanChangeType = 'added' | 'removed' | 'quantity_changed' | 'unchanged';

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

@Injectable({ providedIn: 'root' })
export class SyncService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getLatestCompletedScan(refrigeratorId: string): Promise<Scan | null> {
    const { data, error } = await this.supabaseService.client
      .from('scans')
      .select('id, refrigerator_id, camera_device_id, started_at, finished_at, status, original_image_path, processed_image_path, detected_product_count, error_message, processing_ms, scan_type, initiated_by, created_at, updated_at')
      .eq('refrigerator_id', refrigeratorId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return (data as Scan | null) ?? null;
  }

  async getScanChanges(scanId: string): Promise<ScanChange[]> {
    const { data, error } = await this.supabaseService.client
      .from('scan_changes')
      .select('id, scan_id, product_id, previous_quantity, new_quantity, difference, unit, change_type, confirmation_status, created_at, products(id, name, brand, image_path, ai_label)')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as ScanChange[];
  }

  async applyScanChanges(scanId: string): Promise<void> {
    const { error } = await this.supabaseService.client.rpc('apply_scan_changes', {
      p_scan_id: scanId
    });
    if (error) throw error;
  }

  subscribeToCompletedScans(refrigeratorId: string, onCompleted: () => void): RealtimeChannel {
    return this.supabaseService.client
      .channel(`completed-scans:${refrigeratorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
          filter: `refrigerator_id=eq.${refrigeratorId}`
        },
        payload => {
          const scan = payload.new as Partial<Scan>;
          if (scan.status === 'completed') onCompleted();
        }
      )
      .subscribe();
  }

  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await this.supabaseService.client.removeChannel(channel);
  }
}
