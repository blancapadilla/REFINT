import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  notificationsOutline,
  cubeOutline,
  syncOutline,
  chevronDownOutline,
  cartOutline,
  timeOutline
} from 'ionicons/icons';

// Importamos el servicio
import { HistorialService } from 'src/app/services/historial.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class HistorialPage implements OnInit {

  // Iconos
  settingsOutline = settingsOutline;
  chevronDownOutline = chevronDownOutline;

  // Listas de actividades cargadas desde FastAPI
  todayActivities: any[] = [];
  yesterdayActivities: any[] = [];

  // Mapeo de strings recibidos del backend a objetos de íconos de Ionic
  private iconMap: { [key: string]: any } = {
    notificationsOutline: notificationsOutline,
    cubeOutline: cubeOutline,
    cartOutline: cartOutline,
    syncOutline: syncOutline
  };

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: true },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private historialService: HistorialService // Inyección de servicio
  ) {
    addIcons({
      settingsOutline,
      notificationsOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline,
      chevronDownOutline
    });
  }

  ngOnInit() {
    this.cargarHistorial();
  }

  // Cargar lista inicial de actividades
  cargarHistorial() {
    this.historialService.getHistorial().subscribe({
      next: (res) => {
        this.todayActivities = res.todayActivities.map(item => ({
          ...item,
          icon: this.iconMap[item.icon] || notificationsOutline
        }));

        this.yesterdayActivities = res.yesterdayActivities.map(item => ({
          ...item,
          icon: this.iconMap[item.icon] || syncOutline
        }));
      },
      error: (err) => console.error('Error al obtener el historial:', err)
    });
  }

  // Acción del botón "Cargar más actividad"
  cargarMasActividad() {
    this.historialService.cargarMasActividad().subscribe({
      next: (res) => {
        this.yesterdayActivities = res.yesterdayActivities.map(item => ({
          ...item,
          icon: this.iconMap[item.icon] || syncOutline
        }));
      },
      error: (err) => console.error('Error al cargar más historial:', err)
    });
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}