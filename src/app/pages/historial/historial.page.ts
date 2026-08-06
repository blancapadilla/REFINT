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

interface Actividad {
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
  imports: [CommonModule, IonicModule]
})
export class HistorialPage implements OnInit {

  // Iconos
  settingsOutline = settingsOutline;
  chevronDownOutline = chevronDownOutline;

  // Actividades de ejemplo
  todayActivities: Actividad[] = [
    {
      title: 'Alerta de caducidad',
      description: 'Yogur Griego está a punto de vencer.',
      time: '10:45 AM',
      icon: notificationsOutline,
      color: 'danger'
    },
    {
      title: 'Leche agregada',
      description: 'Se detectaron 2 unidades nuevas.',
      time: '09:20 AM',
      icon: cubeOutline,
      color: 'primary'
    }
  ];

  yesterdayActivities: Actividad[] = [
    {
      title: 'Espinacas agotadas',
      description: 'Añadido automáticamente a Shopping.',
      time: '07:15 PM',
      icon: cartOutline,
      color: 'gray'
    },
    {
      title: 'Sincronización completa',
      description: 'Base de datos actualizada...',
      time: '12:30 PM',
      icon: syncOutline,
      color: 'gray'
    }
  ];

  // Menú inferior: "History" está ACTIVO (active: true)
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: true },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(private router: Router) {
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

  ngOnInit() {}

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  cargarMasActividad() {
    console.log('Cargar más actividades del historial');
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}