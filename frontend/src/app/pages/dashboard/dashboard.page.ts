import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth';
import { addIcons } from 'ionicons';
import {
  calendarOutline, addOutline, syncOutline, analyticsOutline, barChartOutline,
  notificationsOutline, cubeOutline, cartOutline, timeOutline, alertCircleOutline,
  checkmarkCircleOutline, waterOutline, wifiOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class DashboardPage {
  usuario = 'Vanessa';
  totalProductos = 0;
  totalUnidades = 0;
  chartGradient = 'conic-gradient(#e2e8f0 0% 100%)';
  temperatura = '3';

  syncOutline = syncOutline; notificationsOutline = notificationsOutline; cubeOutline = cubeOutline; alertCircleOutline = alertCircleOutline; timeOutline = timeOutline; wifiOutline = wifiOutline;

  deviceStatus = {
    esp: { label: 'ESP32 STATUS', value: 'Offline', state: 'offline' },
    camera: { label: 'CÁMARA', value: 'Inactiva', state: 'offline' },
    lastSync: 'Hace un momento'
  };

  summaryCards = [
    { type: 'warning', title: 'Por vencer', value: '0', subtitle: 'Alimentos próximos a caducar', path: '/alertas' },
    { type: 'danger', title: 'Escaseando', value: '0', subtitle: 'Productos por reabastecer', path: '/lista-compras' }
  ];

  expiringProducts: any[] = [];
  distributionLegend: any[] = [];
  
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
    addIcons({ calendarOutline, addOutline, syncOutline, analyticsOutline, barChartOutline, notificationsOutline, cubeOutline, cartOutline, timeOutline, alertCircleOutline, checkmarkCircleOutline, waterOutline, wifiOutline });
  }

  // 1. REEMPLAZO DE ngOnInit: El Dashboard se actualizará siempre que regreses a él
  async ionViewWillEnter() {
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
          { type: 'warning', title: 'Por vencer', value: `${summary.expiring_products ?? 0}`, subtitle: 'Alimentos próximos a caducar', path: '/alertas' },
          { type: 'danger', title: 'Escaseando', value: `${summary.missing_products ?? summary.low_stock_products ?? 0}`, subtitle: 'Productos por reabastecer', path: '/lista-compras' }
        ];

        this.deviceStatus = {
          esp: { label: 'ESP32 STATUS', value: summary.esp32_status === 'online' ? 'Online' : 'Offline', state: summary.esp32_status ?? 'offline' },
          camera: { label: 'CÁMARA', value: summary.camera_status === 'online' ? 'Activa' : 'Inactiva', state: summary.camera_status ?? 'offline' },
          lastSync: summary.last_sync_at ? 'Actualizado' : 'Pendiente'
        };
      }

      // 2. PRODUCTOS PRÓXIMOS A VENCER Y MATEMÁTICAS DE PROGRESO
      const expiringData = await this.dashboardService.getExpiringProducts();
      this.expiringProducts = (expiringData || []).map((item: any) => {
        const dias = item.days_to_expiry;
        let progreso = 0;
        let venceTexto = 'Sin fecha';

        if (dias != null) {
          if (dias < 0) {
            venceTexto = `Caducó hace ${Math.abs(dias)} día(s)`;
            progreso = 100;
          } else if (dias === 0) {
            venceTexto = 'Vence HOY';
            progreso = 90;
          } else {
            venceTexto = `Vence en ${dias} día(s)`;
            progreso = Math.max(10, 100 - (dias * 20)); // 1 día = 80%, 2 días = 60%, etc.
          }
        }

        return {
          nombre: item.product_name ?? 'Producto',
          image: item.product_image_path || item.image_path || 'assets/images/products/default-product.png',
          vence: venceTexto,
          progreso: progreso,
          clase: item.status === 'caducado' ? 'danger' : 'warning'
        };
      });

      // 3. GRÁFICA DE DISTRIBUCIÓN DINÁMICA
      // 3. GRÁFICA DE DISTRIBUCIÓN DINÁMICA
      const distData = await this.dashboardService.getInventoryDistribution();
      let lacteos = 0, vegetales = 0, proteinas = 0, otros = 0, totalChart = 0;

      distData.forEach((item: any) => {
        const catName = (item.category_name || '').toLowerCase();
        const prodName = (item.product_name || '').toLowerCase();
        
        // Sumamos la CANTIDAD real del producto (ej. 12 papas + 6 tomates)
        const qty = Number(item.quantity ?? 0); 
        totalChart += qty;

        if (catName.includes('lácteo') || catName.includes('lacteo') || prodName.includes('leche') || prodName.includes('queso') || prodName.includes('yogurt')) lacteos += qty;
        else if (catName.includes('fruta') || catName.includes('verdura') || prodName.includes('tomate') || prodName.includes('espinaca') || prodName.includes('apio') || prodName.includes('platano')) vegetales += qty;
        else if (catName.includes('carne') || catName.includes('proteína') || prodName.includes('pollo')) proteinas += qty;
        else otros += qty;
      });

      // Guardamos el total físico para mostrarlo en el centro de la dona
      this.totalUnidades = totalChart;

      if (totalChart > 0) {
        const pLacteos = Math.round((lacteos / totalChart) * 100);
        const pVegetales = Math.round((vegetales / totalChart) * 100);
        const pProteinas = Math.round((proteinas / totalChart) * 100);
        const pOtros = 100 - pLacteos - pVegetales - pProteinas;

        this.distributionLegend = [];
        const stops = [];
        let currentPct = 0;

        if (pLacteos > 0) {
          this.distributionLegend.push({ color: 'primary', label: 'Lácteos & Huevos', percent: pLacteos });
          stops.push(`#004ac6 ${currentPct}% ${currentPct + pLacteos}%`);
          currentPct += pLacteos;
        }
        if (pVegetales > 0) {
          this.distributionLegend.push({ color: 'secondary', label: 'Vegetales', percent: pVegetales });
          stops.push(`#64a8fe ${currentPct}% ${currentPct + pVegetales}%`);
          currentPct += pVegetales;
        }
        if (pProteinas > 0) {
          this.distributionLegend.push({ color: 'tertiary', label: 'Proteínas', percent: pProteinas });
          stops.push(`#006229 ${currentPct}% ${currentPct + pProteinas}%`);
          currentPct += pProteinas;
        }
        // Agregamos la categoría "Otros" visualmente a la leyenda
        if (pOtros > 0) {
          this.distributionLegend.push({ color: 'gray', label: 'Otros (Snacks, Bebidas)', percent: pOtros });
          stops.push(`#94a3b8 ${currentPct}% 100%`);
        }
        
        this.chartGradient = stops.length > 0 ? `conic-gradient(${stops.join(', ')})` : 'conic-gradient(#e2e8f0 0% 100%)';
      } else {
        this.distributionLegend = [];
        this.chartGradient = 'conic-gradient(#e2e8f0 0% 100%)';
      }
     } catch (error) {
      console.error('Error al cargar datos del Dashboard:', error);
    }
  }

  irAEstadoSistema() { this.router.navigate(['/estado-sistema']); }
  ejecutarAccion(action: string) {
    if (action === 'sync') this.router.navigate(['/comparacion']);
    if (action === 'alerts') this.router.navigate(['/alertas']);
  }
  irA(ruta: string) { this.router.navigate([ruta]); }
  navegar(item: any) { if (item.path) this.router.navigate([item.path]); }
}