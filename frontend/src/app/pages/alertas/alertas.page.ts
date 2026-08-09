import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  alertCircleOutline,
  timeOutline,
  closeCircleOutline,
  calendarOutline,
  basketOutline,
  cloudOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  notificationsOutline
} from 'ionicons/icons';

// Importamos el servicio
import { AlertasService } from 'src/app/services/alertas.service';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlertasPage implements OnInit {

  // Iconos principales
  settingsOutline = settingsOutline;
  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;

  // Resumen y alertas cargadas dinámicamente
  resumen = { criticas: 0, proximos: 0 };
  alerts: any[] = [];

  // Mapeo de nombres de texto a íconos reales de IonIcons
  private iconMap: { [key: string]: any } = {
    closeCircleOutline: closeCircleOutline,
    calendarOutline: calendarOutline,
    basketOutline: basketOutline,
    cloudOutline: cloudOutline,
    alertCircleOutline: alertCircleOutline
  };

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: true }
  ];

  constructor(
    private router: Router,
    private alertasService: AlertasService // Inyección de servicio
  ) {
    addIcons({
      settingsOutline,
      alertCircleOutline,
      timeOutline,
      closeCircleOutline,
      calendarOutline,
      basketOutline,
      cloudOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      notificationsOutline
    });
  }

  ngOnInit() {
    this.cargarAlertas();
  }

  cargarAlertas() {
    this.alertasService.getAlertas().subscribe({
      next: (res) => {
        this.resumen = res.resumen;
        this.alerts = res.alerts.map(alert => ({
          ...alert,
          icon: this.iconMap[alert.icon] || alertCircleOutline
        }));
      },
      error: (err) => console.error('Error al cargar alertas:', err)
    });
  }

  marcarTodoLeido() {
    this.alertasService.marcarTodoLeido().subscribe({
      next: () => {
        this.alerts = [];
        this.resumen = { criticas: 0, proximos: 0 };
      },
      error: (err) => console.error('Error al marcar todo como leído:', err)
    });
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  irAListaCompras() {
    this.router.navigate(['/lista-compras']);
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}