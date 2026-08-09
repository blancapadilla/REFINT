import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { addIcons } from 'ionicons';
import {
  settingsOutline,
  searchOutline,
  alertCircleOutline,
  notificationsOutline,
  timeOutline,
  closeCircleOutline,
  calendarOutline,
  basketOutline,
  cloudOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  listOutline,
  homeOutline
} from 'ionicons/icons';

interface AlertItem {
  type: 'critical' | 'warning' | 'yellow' | 'success';
  icon: string;
  title: string;
  time: string;
  description: string;
  action?: string;
  secondaryAction?: string;
  status?: string;
}

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class AlertasPage {
  alerts: AlertItem[] = [
    {
      type: 'critical',
      icon: 'close-circle-outline',
      title: 'Leche Entera (2L)',
      time: 'Hace 5 min',
      description:
        'El producto está completamente agotado. No quedan existencias en el compartimiento principal.',
      action: 'Añadir al Carrito',
      secondaryAction: 'Omitir'
    },
    {
      type: 'warning',
      icon: 'calendar-outline',
      title: 'Yogur Griego Natural',
      time: 'Hace 1 hora',
      description:
        'Vence mañana. Se recomienda consumir pronto o usar en recetas de repostería.',
      action: 'Ver Recetas',
      status: '85% expirado'
    },
    {
      type: 'yellow',
      icon: 'basket-outline',
      title: 'Huevos (Docena)',
      time: 'Hace 3 horas',
      description:
        'Quedan solo 2 unidades. Tu consumo promedio indica que necesitarás más en 2 días.',
      action: 'Comprar'
    },
    {
      type: 'success',
      icon: 'cloud-outline',
      title: 'Inventario Sincronizado',
      time: 'Hoy, 08:45 AM',
      description:
        'Se han actualizado 12 artículos correctamente después de tu visita al supermercado.',
      action: 'Ver detalles'
    }
  ];

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false, badge: false },
    { id: 'shopping', label: 'Lista', icon: cartOutline, path: '/lista-compras', active: false, badge: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false, badge: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false, badge: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: true, badge: false }
  ];

  searchOutline = searchOutline;
  settingsOutline = settingsOutline;

  constructor(private router: Router) {
    addIcons({
      'settings-outline': settingsOutline,
      'search-outline': searchOutline,
      'alert-circle-outline': alertCircleOutline,
      'time-outline': timeOutline,
      'close-circle-outline': closeCircleOutline,
      'calendar-outline': calendarOutline,
      'basket-outline': basketOutline,
      'cloud-outline': cloudOutline,
      'home-outline': homeOutline,
      'cart-outline': cartOutline,
      'sync-outline': syncOutline,
      'list-outline': listOutline
    });
  }

  irADashboard() {
    this.router.navigate(['/inventario']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  buscar() {
    console.log('Buscar en alertas');
  }

  navegar(item: any) {
    this.bottomNavItems = this.bottomNavItems.map(nav => ({
      ...nav,
      active: nav.id === item.id
    }));

    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}
