import { Injectable } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseService } from './supabase';

export interface HardwareCommand {
  id: string;
  refrigerator_id: string;
  command: 'scan';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scan_id: string | null;
  error_message: string | null;
}

@Injectable({ providedIn: 'root' })
export class HardwareService {
  constructor(private supabase: SupabaseService) {}

  async getLatestTemperature(refrigeratorId: string): Promise<number | null> {
    const { data, error } = await this.supabase.client
      .from('temperature_readings')
      .select('temperature_c, recorded_at')
      .eq('refrigerator_id', refrigeratorId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data?.temperature_c == null ? null : Number(data.temperature_c);
  }

  subscribeToTemperature(
    refrigeratorId: string,
    onTemperature: (temperature: number) => void
  ): RealtimeChannel {
    return this.supabase.client
      .channel(`temperature:${refrigeratorId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'temperature_readings',
        filter: `refrigerator_id=eq.${refrigeratorId}`
      }, payload => onTemperature(Number((payload.new as any).temperature_c)))
      .subscribe();
  }

  async requestScan(refrigeratorId: string): Promise<HardwareCommand> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { data, error } = await this.supabase.client
      .from('hardware_commands')
      .insert({
        refrigerator_id: refrigeratorId,
        command: 'scan',
        status: 'pending',
        requested_by: user.id
      })
      .select('id,refrigerator_id,command,status,scan_id,error_message')
      .single();
    if (error) throw error;
    return data as HardwareCommand;
  }

  subscribeToCommand(
    commandId: string,
    onUpdate: (command: HardwareCommand) => void
  ): RealtimeChannel {
    return this.supabase.client
      .channel(`hardware-command:${commandId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'hardware_commands',
        filter: `id=eq.${commandId}`
      }, payload => onUpdate(payload.new as HardwareCommand))
      .subscribe();
  }

  async unsubscribe(channel: RealtimeChannel): Promise<void> {
    await this.supabase.client.removeChannel(channel);
  }
}
