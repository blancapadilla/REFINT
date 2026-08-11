import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { HistorialService, ActivityItem, ScanItem } from '../../services/historial.service';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, cubeOutline, cartOutline, syncOutline,
  chevronDownOutline, timeOutline, alertCircleOutline, cameraOutline,
  addOutline, removeOutline, chevronForwardOutline, searchOutline, settingsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent]
})
export class HistorialPage implements OnInit {
  tabActivo: 'actividad' | 'escaneos' = 'actividad';
  cargando = true;
  error = '';

  todayActivities: ActivityItem[] = [];
  yesterdayActivities: ActivityItem[] = [];
  escaneos: ScanItem[] = [];

 bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: true },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private historialService: HistorialService
  ) {
    addIcons({
      notificationsOutline, cubeOutline, cartOutline, syncOutline,
      chevronDownOutline, timeOutline, alertCircleOutline, cameraOutline,
      addOutline, removeOutline, chevronForwardOutline, searchOutline, settingsOutline
    });
  }

  async ngOnInit() {
    try {
      await this.cargarDatos();
    } catch (e: any) {
      this.error = e?.message ?? 'Error al cargar historial.';
    } finally {
      this.cargando = false;
    }
  }

  async cargarDatos() {
    const [actividades, escaneos] = await Promise.all([
      this.historialService.getActividades(),
      this.historialService.getEscaneos()
    ]);
    this.todayActivities     = actividades.hoy;
    this.yesterdayActivities = actividades.ayer;
    this.escaneos            = escaneos;
  }

  buscar() {
    console.log('Buscar en historial');
  }

  navegar(item: any) {
    this.bottomNavItems = this.bottomNavItems.map(nav => ({ ...nav, active: nav.id === item.id }));
    if (item.path) this.router.navigate([item.path]);
  }
}
