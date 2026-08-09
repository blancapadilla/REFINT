import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

import { addIcons } from 'ionicons';
import {
  settingsOutline,
  searchOutline,
  notificationsOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  chevronDownOutline,
  homeOutline,
  listOutline,
  timeOutline,
  alertCircleOutline
} from 'ionicons/icons';

interface Activity {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: 'danger' | 'primary' | 'gray';
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class HistorialPage implements OnInit {
  todayActivities: Activity[] = [
    {
      title: 'Alerta de caducidad',
      description: 'Yogur Griego está a punto de vencer.',
      time: '10:45 AM',
      icon: 'notifications-outline',
      color: 'danger'
    },
    {
      title: 'Leche agregada',
      description: 'Se detectaron 2 unidades nuevas.',
      time: '09:20 AM',
      icon: 'cube-outline',
      color: 'primary'
    }
  ];

  yesterdayActivities: Activity[] = [
    {
      title: 'Espinacas agotadas',
      description: 'Añadido automáticamente a Shopping.',
      time: '07:15 PM',
      icon: 'cart-outline',
      color: 'gray'
    },
    {
      title: 'Sincronización completa',
      description: 'Base de datos actualizada...',
      time: '12:30 PM',
      icon: 'sync-outline',
      color: 'gray'
    }
  ];

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false, badge: false },
    { id: 'shopping', label: 'Lista', icon: cartOutline, path: '/lista-compras', active: false, badge: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false, badge: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: true, badge: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false, badge: false }
  ];

  searchOutline = searchOutline;
  settingsOutline = settingsOutline;

  constructor(private router: Router) {
    addIcons({
      'settings-outline': settingsOutline,
      'search-outline': searchOutline,
      'notifications-outline': notificationsOutline,
      'cube-outline': cubeOutline,
      'cart-outline': cartOutline,
      'sync-outline': syncOutline,
      'chevron-down-outline': chevronDownOutline,
      'home-outline': homeOutline,
      'list-outline': listOutline,
      'time-outline': timeOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }

  irADashboard() {
    this.router.navigate(['/inventario']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  buscar() {
    console.log('Buscar en historial');
  }

  ngOnInit() {
    const currentPath = this.router.url;
    this.bottomNavItems = this.bottomNavItems.map(nav => ({
      ...nav,
      active: nav.path === currentPath
    }));
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