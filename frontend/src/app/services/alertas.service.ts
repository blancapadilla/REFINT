import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertaItem {
  id: string;
  type: 'critical' | 'warning' | 'yellow' | 'success';
  icon: string;
  title: string;
  time: string;
  description: string;
  action?: string;
  secondaryAction?: string;
  status?: string;
  progreso?: number;
}

export interface ResumenAlertas {
  criticas: number;
  proximos: number;
}

export interface AlertasResponse {
  resumen: ResumenAlertas;
  alerts: AlertaItem[];
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private apiUrl = 'http://localhost:8000/api/v1/alertas';

  constructor(private http: HttpClient) {}

  getAlertas(): Observable<AlertasResponse> {
    return this.http.get<AlertasResponse>(this.apiUrl);
  }

  marcarTodoLeido(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/marcar-leido`, {});
  }
}