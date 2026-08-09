import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private supabaseService: SupabaseService) {}

  async getInventory() {

    const { data, error } = await this.supabaseService.client
      .from('v_inventory_current')
      .select('*');

    if (error) {
      console.error('Error obteniendo inventario:', error);
      throw error;
    }

    return data;
  }
}