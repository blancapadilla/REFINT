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

interface AlertaItem {
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

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AlertasPage implements OnInit {

  // Iconos
  settingsOutline = settingsOutline;
  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;

  // Alertas de ejemplo
  alerts: AlertaItem[] = [
    {
      type: 'critical',
      icon: closeCircleOutline,
      title: 'Leche Entera (2L)',
      time: 'Hace 5 min',
      description: 'El producto está completamente agotado. No quedan existencias en el compartimiento principal.',
      action: 'Añadir al Carrito',
      secondaryAction: 'Omitir'
    },
    {
      type: 'warning',
      icon: calendarOutline,
      title: 'Yogur Griego Natural',
      time: 'Hace 1 hora',
      description: 'Vence mañana. Se recomienda consumir pronto o usar en recetas de repostería.',
      action: 'Ver Recetas',
      status: '85% del tiempo transcurrido',
      progreso: 85
    },
    {
      type: 'yellow',
      icon: basketOutline,
      title: 'Huevos (Docena)',
      time: 'Hace 3 horas',
      description: 'Quedan solo 2 unidades. Tu consumo promedio indica que necesitarás más en 2 días.',
      action: 'Comprar'
    },
    {
      type: 'success',
      icon: cloudOutline,
      title: 'Inventario Sincronizado',
      time: 'Hoy, 08:45 AM',
      description: 'Se han actualizado 12 artículos correctamente después de tu visita al supermercado.',
      action: 'Ver detalles'
    }
  ];

  // Menú inferior: "Alerts" está ACTIVO (active: true)
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: true }
  ];

  constructor(private router: Router) {
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

  ngOnInit() {}

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  marcarTodoLeido() {
    console.log('Marcar todas las alertas como leídas');
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