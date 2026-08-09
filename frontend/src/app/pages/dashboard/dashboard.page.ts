import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { InventarioService } from '../../services/inventario.service';
import { AuthService } from '../../services/auth';
import { RefrigeradorService } from '../../services/refrigerador.service';

import { addIcons } from 'ionicons';

import {
  snowOutline,
  settingsOutline,
  searchOutline,
  filterOutline,
  calendarOutline,
  createOutline,
  trashOutline,
  addOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline,
  notificationsOutline,
  analyticsOutline,
  alertCircleOutline,
  barChartOutline,
  wifiOutline,
  cameraOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class DashboardPage implements OnInit {

  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'todos';
  usuario = 'Vanessa';
  totalProductos = 0;
  chartGradient = 'conic-gradient(#004ac6 0% 65%, #64a8fe 65% 85%, #006229 85% 100%)';

  snowOutline = snowOutline;
  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  filterOutline = filterOutline;
  calendarOutline = calendarOutline;
  createOutline = createOutline;
  trashOutline = trashOutline;
  addOutline = addOutline;
  cubeOutline = cubeOutline;
  cartOutline = cartOutline;
  syncOutline = syncOutline;
  timeOutline = timeOutline;
  notificationsOutline = notificationsOutline;
  analyticsOutline = analyticsOutline;
  alertCircleOutline = alertCircleOutline;
  barChartOutline = barChartOutline;
  wifiOutline = wifiOutline;
  cameraOutline = cameraOutline;

  statusCards = [
    { color: 'primary', icon: this.calendarOutline, title: 'Temperatura', value: '3 °C', subtitle: 'Óptima' },
    { color: 'secondary', icon: this.addOutline, title: 'Humedad', value: '45 %', subtitle: 'Nivel Estable' }
  ];

  summaryCards = [
    { type: 'warning', title: 'Por vencer', value: '3', subtitle: 'Alimentos próximos a caducar' },
    { type: 'danger', title: 'Escaseando', value: '5', subtitle: 'Productos por reabastecer' }
  ];

  expiringProducts = [
    { nombre: 'Leche Entera', image: 'assets/images/products/lecheentera.webp', vence: '1 día restante', progreso: 10, clase: 'danger' },
    { nombre: 'Espinacas', image: 'assets/images/products/espinacas.png', vence: '3 días restantes', progreso: 30, clase: 'warning' }
  ];

  distributionLegend = [
    { color: 'primary', label: 'Lácteos & Huevos', percent: 65 },
    { color: 'secondary', label: 'Vegetales', percent: 20 },
    { color: 'tertiary', label: 'Proteínas', percent: 15 }
  ];

  recipeSuggestions = [
    { title: 'Omelette Cremoso de Espinacas', description: 'Receta recomendada', variant: 'green', image: 'assets/images/recipes/omeleet.png' },
    { title: 'Quiche de Tres Quesos', description: 'Lácteos por vencer', variant: 'orange', image: 'assets/images/recipes/quiche.jpg' }
  ];

  deviceStatus = {
    esp: { label: 'ESP32 STATUS', value: 'Online', state: 'online' },
    camera: { label: 'CÁMARA', value: 'Activa', state: 'online' },
    wifi: { label: 'WIFI', value: 'Excelente', state: 'online' },
    temperature: { label: 'TEMPERATURA', value: '3°C Óptima', state: 'online' },
    lastSync: 'Hace 2 min'
  };

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private inventarioService: InventarioService,
    private authService: AuthService,
    private refrigeradorService: RefrigeradorService
  ) {
    addIcons({
      snowOutline,
      settingsOutline,
      searchOutline,
      filterOutline,
      calendarOutline,
      createOutline,
      trashOutline,
      addOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline,
      notificationsOutline,
      analyticsOutline,
      alertCircleOutline,
      barChartOutline,
      wifiOutline,
      cameraOutline
    });
  }

  async ngOnInit() {
    const session = await this.authService.getSession();
    if (!session) {
      await this.router.navigate(['/login']);
      return;
    }
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