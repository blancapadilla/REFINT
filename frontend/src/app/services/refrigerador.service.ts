import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

export interface Refrigerador {
  id: string;
  name: string;
  code: string;
}

@Injectable({ providedIn: 'root' })
export class RefrigeradorService {
  constructor(private supabase: SupabaseService) {}

  async getMiRefrigerador(): Promise<Refrigerador | null> {
    const { data } = await this.supabase.client
      .from('refrigerators')
      .select('id, name, code')
      .limit(1)
      .single();
    return data ?? null;
  }

  async registrar(name: string, code: string): Promise<void> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) throw new Error('No hay sesión activa.');

    const { error } = await this.supabase.client
      .from('refrigerators')
      .insert({ owner_id: user.id, name, code, timezone: 'America/Mexico_City' });

    if (error) throw error;
  }

  async tieneRefrigerador(): Promise<boolean> {
    const { count } = await this.supabase.client
      .from('refrigerators')
      .select('id', { count: 'exact', head: true });
    return (count ?? 0) > 0;
  }
}
