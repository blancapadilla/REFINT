import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioPerfil {
  nombre: string;
  email: string;
  plan: string;
  avatarUrl: string;
}

export interface DispositivosConfig {
  camaraConectada: boolean;
}

export interface PreferenciasApp {
  notificacionesActivadas: boolean;
  idioma: string;
  esModoOscuro: boolean;
}

export interface ConfiguracionResponse {
  perfil: UsuarioPerfil;
  dispositivos: DispositivosConfig;
  preferencias: PreferenciasApp;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private apiUrl = 'http://localhost:8000/api/v1/configuracion';

  constructor(private http: HttpClient) {}

  getConfiguracion(): Observable<ConfiguracionResponse> {
    return this.http.get<ConfiguracionResponse>(this.apiUrl);
  }

  actualizarPreferencias(preferencias: Partial<PreferenciasApp>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/preferencias`, preferencias);
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout`, {});
  }
}