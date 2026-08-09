import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Actividad {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: 'danger' | 'primary' | 'gray';
}

export interface HistorialResponse {
  todayActivities: Actividad[];
  yesterdayActivities: Actividad[];
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private apiUrl = 'http://localhost:8000/api/v1/historial';

  constructor(private http: HttpClient) {}

  getHistorial(): Observable<HistorialResponse> {
    return this.http.get<HistorialResponse>(this.apiUrl);
  }

  cargarMasActividad(): Observable<HistorialResponse> {
    return this.http.get<HistorialResponse>(`${this.apiUrl}/mas`);
  }
}