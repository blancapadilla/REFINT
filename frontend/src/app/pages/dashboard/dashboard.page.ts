import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth';
import { addIcons } from 'ionicons';

import {
  calendarOutline,
  addOutline,
  syncOutline,
  analyticsOutline,
  barChartOutline,
  notificationsOutline,
  cubeOutline,
  cartOutline,
  timeOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  waterOutline,
  wifiOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class DashboardPage implements OnInit {

  usuario = 'Vanessa';
  totalProductos = 0;
  chartGradient = 'conic-gradient(#004ac6 0% 65%, #64a8fe 65% 85%, #006229 85% 100%)';

  syncOutline = syncOutline;
  notificationsOutline = notificationsOutline;
  cubeOutline = cubeOutline;
  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;
  wifiOutline = wifiOutline;

  temperatura = '3';
  humedad = '45';

  deviceStatus = {
    esp: { label: 'ESP32 STATUS', value: 'Online', state: 'online' },
    camera: { label: 'CÁMARA', value: 'Activa', state: 'online' },
    lastSync: 'Hace 2 min'
  };

  summaryCards = [
    { type: 'warning', title: 'Por vencer', value: '0', subtitle: 'Alimentos próximos a caducar', path: '/alertas' },
    { type: 'danger', title: 'Escaseando', value: '0', subtitle: 'Productos por reabastecer', path: '/lista-compras' }
  ];

  expiringProducts: Array<{
    nombre: string;
    image: string;
    vence: string;
    progreso: number;
    clase: string;
  }> = [];

  distributionLegend = [
    { color: 'primary', label: 'Lácteos & Huevos', percent: 65 },
    { color: 'secondary', label: 'Vegetales', percent: 20 },
    { color: 'tertiary', label: 'Proteínas', percent: 15 }
  ];

  recipeSuggestions = [
    { title: 'Omelette Cremoso de Espinacas', description: 'Receta recomendada', variant: 'green', image: 'assets/images/recipes/omeleet.png' },
    { title: 'Quiche de Tres Quesos', description: 'Lácteos por vencer', variant: 'orange', image: 'assets/images/recipes/quiche.jpg' }
  ];

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    addIcons({
      calendarOutline,
      addOutline,
      syncOutline,
      analyticsOutline,
      barChartOutline,
      notificationsOutline,
      cubeOutline,
      cartOutline,
      timeOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
      waterOutline,
      wifiOutline
    });
  }

  async ngOnInit() {
    const session = await this.authService.getSession();
    if (!session) {
      await this.router.navigate(['/login']);
      return;
    }

    await this.cargarDashboard();
  }

  async cargarDashboard() {
    try {
      const summary = await this.dashboardService.getSummary();

      if (summary) {
        this.totalProductos = summary.total_products ?? 0;
        this.temperatura = summary.current_temperature_c != null ? `${summary.current_temperature_c}` : '3';

        this.summaryCards = [
          { 
          type: 'warning', 
          title: 'Por vencer', 
          value: `${summary.expiring_products ?? 0}`, 
          subtitle: 'Alimentos próximos a caducar',
          path: '/alertas'
        },
        { 
          type: 'danger', 
          title: 'Escaseando', 
          value: `${summary.missing_products ?? summary.low_stock_products ?? 0}`, 
          subtitle: 'Productos por reabastecer',
          path: '/lista-compras'
        }
        ];

        this.deviceStatus = {
          esp: { 
            label: 'ESP32 STATUS', 
            value: summary.esp32_status === 'online' ? 'Online' : 'Offline', 
            state: summary.esp32_status ?? 'offline' 
          },
          camera: { 
            label: 'CÁMARA', 
            value: summary.camera_status === 'online' ? 'Activa' : 'Inactiva', 
            state: summary.camera_status ?? 'offline' 
          },
          lastSync: summary.last_sync_at ? 'Hace 2 min' : 'Hace 2 min'
        };
      }

      const expiringData = await this.dashboardService.getExpiringProducts();
      
      this.expiringProducts = (expiringData || []).map((item: any) => ({
        nombre: item.product_name ?? 'Producto',
        image: item.product_image_path || item.image_path || 'assets/images/products/default-product.png',
        vence: item.expires_on ? `Vence: ${item.expires_on}` : 'Próximo a vencer',
        progreso: item.days_to_expiry != null ? Math.max(10, Math.min(100, item.days_to_expiry * 20)) : 30,
        clase: item.status === 'caducado' ? 'danger' : 'warning'
      }));

    } catch (error) {
      console.error('Error al cargar datos del Dashboard:', error);
    }
  }

  irAEstadoSistema() {
    this.router.navigate(['/estado-sistema']);
  }

  ejecutarAccion(action: string) {
    if (action === 'sync') this.router.navigate(['/comparacion']);
    if (action === 'alerts') this.router.navigate(['/alertas']);
  }

  irA(ruta: string) { this.router.navigate([ruta]); }
  irAConfiguracion() { this.router.navigate(['/configuracion']); }
  buscar() { console.log('Búsqueda'); }
  navegar(item: any) { if (item.path) this.router.navigate([item.path]); }
}