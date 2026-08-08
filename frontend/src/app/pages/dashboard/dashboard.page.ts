import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  snowOutline, 
  settingsOutline, 
  syncOutline, 
  notificationsOutline, 
  thermometerOutline, 
  waterOutline, 
  cubeOutline,
  alertCircleOutline,
  cartOutline,
  timeOutline,
  gridOutline
} from 'ionicons/icons';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DashboardPage implements OnInit {
  usuario = 'Vanessa';
  totalProductos = 42;
  chartGradient = 'conic-gradient(#004ac6 0% 65%, #64a8fe 65% 85%, #006229 85% 100%)';

  snowOutline = snowOutline;
  settingsOutline = settingsOutline;
  alertCircleOutline = alertCircleOutline;
  notificationsOutline = notificationsOutline;
  cubeOutline = cubeOutline;

  quickActions = [
    { type: 'sync', label: 'Sincronizar', icon: syncOutline },
    { type: 'alerts', label: 'Ver Alertas', icon: notificationsOutline }
  ];

  statusCards = [
    { color: 'primary', icon: thermometerOutline, title: 'Temperatura', value: '3 °C', subtitle: 'Óptima' },
    { color: 'secondary', icon: waterOutline, title: 'Humedad', value: '45 %', subtitle: 'Nivel Estable' }
  ];

  summaryCards = [
    { type: 'warning', title: 'Por vencer', value: '3', subtitle: 'Alimentos próximos a caducar' },
    { type: 'danger', title: 'Escaseando', value: '5', subtitle: 'Productos por reabastecer' }
  ];

  productos = [
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

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(private router: Router, private dashboardService: DashboardService) {
    addIcons({
      snowOutline,
      settingsOutline,
      syncOutline,
      notificationsOutline,
      thermometerOutline,
      waterOutline,
      cubeOutline,
      alertCircleOutline,
      cartOutline,
      timeOutline,
      gridOutline
    });
  }

  ngOnInit() { this.cargarDashboard(); }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  irA(ruta: string) {
    this.router.navigate([ruta]);
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }

  cargarDashboard() {
  this.dashboardService.getDashboardData().subscribe({
    next: (data) => {
      this.usuario = data.usuario;
      this.totalProductos = data.resumen.total_productos;
      
      // Mapear tarjetas de sensores
      this.statusCards = [
        { color: data.sensores.temperatura.color, icon: thermometerOutline, title: 'Temperatura', value: data.sensores.temperatura.valor, subtitle: data.sensores.temperatura.estado },
        { color: data.sensores.humedad.color, icon: waterOutline, title: 'Humedad', value: data.sensores.humedad.valor, subtitle: data.sensores.humedad.estado }
      ];

      // Mapear tarjetas de resumen
      this.summaryCards = [
        { type: 'warning', title: 'Por vencer', value: data.resumen.por_vencer.toString(), subtitle: 'Alimentos próximos a caducar' },
        { type: 'danger', title: 'Escaseando', value: data.resumen.escaseando.toString(), subtitle: 'Productos por reabastecer' }
      ];

      this.productos = data.productos_por_vencer;
      this.distributionLegend = data.distribucion;
      this.recipeSuggestions = data.recetas_recomendadas;
    },
    error: (err) => {
      console.error('Error al cargar datos del dashboard:', err);
    }
  });
  }
}

