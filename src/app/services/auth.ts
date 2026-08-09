import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async signUpWithPassword(email: string, password: string) {
    return this.supabaseService.client.auth.signUp({
      email,
      password
    });
  }

  async signInWithPassword(email: string, password: string) {
    return this.supabaseService.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    return this.supabaseService.client.auth.signOut();
  }

  async getSession() {
    const { data } = await this.supabaseService.client.auth.getSession();
    return data.session;
  }
}
