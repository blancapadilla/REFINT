import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth';
import { HardwareService } from '../../services/hardware.service';
import { RefrigeradorService } from '../../services/refrigerador.service';
import { RealtimeChannel } from '@supabase/supabase-js';
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
export class DashboardPage implements OnInit, OnDestroy {

  usuario = 'Vanessa';
  totalProductos = 0;
  totalUnidades = 0;
  chartGradient = 'conic-gradient(#e2e8f0 0% 100%)';

  // Íconos para la vista
  syncOutline = syncOutline;
  notificationsOutline = notificationsOutline;
  cubeOutline = cubeOutline;
  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;
  wifiOutline = wifiOutline;

  // Variables de Hardware / Sensores (Arduino / ESP32)
  temperatura = '--';
  humedad = '45';

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
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  private temperatureChannel: RealtimeChannel | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private hardwareService: HardwareService,
    private refrigeradorService: RefrigeradorService
  ) {
    addIcons({
      calendarOutline, addOutline, syncOutline, analyticsOutline, barChartOutline,
      notificationsOutline, cubeOutline, cartOutline, timeOutline, alertCircleOutline,
      checkmarkCircleOutline, waterOutline, wifiOutline
    });
  }

  ngOnInit() {}

  // Se ejecuta cada vez que la pantalla pasa al frente
  async ionViewWillEnter() {
    const session = await this.authService.getSession();
    if (!session) {
      await this.router.navigate(['/login']);
      return;
    }
    await this.cargarDashboard();
    await this.conectarTemperatura();
  }

  // Conexión Realtime al sensor de temperatura del Arduino / ESP32
  async conectarTemperatura() {
    const refrigerator = await this.refrigeradorService.getMiRefrigerador();
    if (!refrigerator) return;

    const latest = await this.hardwareService.getLatestTemperature(refrigerator.id);
    if (latest != null) {
      this.temperatura = latest.toFixed(2);
    }

    this.temperatureChannel = this.hardwareService.subscribeToTemperature(
      refrigerator.id,
      value => this.temperatura = value.toFixed(2)
    );
  }

  // Cancelamos la suscripción Realtime al salir de la pantalla
  ngOnDestroy() {
    if (this.temperatureChannel) {
      void this.hardwareService.unsubscribe(this.temperatureChannel);
    }
  }

  async cargarDashboard() {
    try {
      // 1. OBTENEMOS EL REFRIGERADOR ACTIVO
      const fridge = await this.refrigeradorService.getMiRefrigerador();
      if (!fridge) return;

      // 2. CONSULTAMOS EL INVENTARIO VIVO
      const inventory = await this.dashboardService['supabase'].client
        .from('v_inventory_current')
        .select('*')
        .eq('refrigerator_id', fridge.id);

      const items = inventory.data || [];
      this.totalProductos = items.length;

      let porVencer = 0;
      let escaseando = 0;

      // 3. CLASIFICACIÓN MATEMÁTICA EXACTA
      items.forEach((item: any) => {
        const dias = item.days_to_expiry != null ? Number(item.days_to_expiry) : null;
        const cantidad = Number(item.quantity ?? 0);

        // A. ESCASEANDO (Agotados + Caducados + Stock Bajo)
        if (
          item.status === 'agotado' || 
          cantidad <= 0 || 
          item.status === 'caducado' || 
          (dias !== null && dias < 0) || 
          item.status === 'bajo'
        ) {
          escaseando++;
        }

        // B. POR VENCER (Solo alimentos vigentes que caducan en 0 a 3 días)
        else if (
          (item.status === 'proximo_a_caducar' || (dias !== null && dias >= 0 && dias <= 3)) &&
          cantidad > 0
        ) {
          porVencer++;
        }
      });

      // 4. ACTUALIZAMOS LAS TARJETAS PRINCIPALES
      this.summaryCards = [
        { 
          type: 'warning', 
          title: 'Por vencer', 
          value: `${porVencer}`, 
          subtitle: 'Alimentos próximos a caducar',
          path: '/alertas'
        },
        { 
          type: 'danger', 
          title: 'Escaseando', 
          value: `${escaseando}`, 
          subtitle: 'Productos por reabastecer',
          path: '/lista-compras'
        }
      ];

      // 5. ESTADO DEL HARDWARE Y TEMPERATURA
      const summary = await this.dashboardService.getSummary();
      if (summary) {
        if (summary.current_temperature_c != null && this.temperatura === '--') {
          this.temperatura = Number(summary.current_temperature_c).toFixed(2);
        }

        if (summary.current_humidity != null) {
          this.humedad = `${summary.current_humidity}`;
        }

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
          lastSync: summary.last_sync_at ? 'Actualizado' : 'Pendiente'
        };
      }

      // 6. LISTA DE PRODUCTOS PRÓXIMOS A VENCER
      const expiringData = await this.dashboardService.getExpiringProducts();
      const DEFAULT_SVG = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="4" fill="%23f1f5f9" stroke="none"/%3E%3Cpath d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/%3E%3Cpolyline points="3.27 6.96 12 12.01 20.73 6.96"/%3E%3Cline x1="12" y1="22.08" x2="12" y2="12"/%3E%3C/svg%3E';

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
            progreso = Math.max(10, 100 - (dias * 20));
          }
        }

        return {
          nombre: item.product_name ?? 'Producto',
          image: item.product_image_path || item.image_path || DEFAULT_SVG,
          vence: venceTexto,
          progreso: progreso,
          clase: (item.status === 'caducado' || (dias !== null && dias < 0)) ? 'danger' : 'warning'
        };
      });

      // 7. GRÁFICA DE DISTRIBUCIÓN
      const distData = await this.dashboardService.getInventoryDistribution();
      let lacteos = 0, vegetales = 0, proteinas = 0, otros = 0, totalChart = 0;

      distData.forEach((item: any) => {
        const catName = (item.category_name || '').toLowerCase();
        const prodName = (item.product_name || '').toLowerCase();
        const qty = Number(item.quantity ?? 0); 
        totalChart += qty;

        if (catName.includes('lácteo') || catName.includes('lacteo') || prodName.includes('leche') || prodName.includes('queso') || prodName.includes('yogurt')) lacteos += qty;
        else if (catName.includes('fruta') || catName.includes('verdura') || prodName.includes('tomate') || prodName.includes('espinaca') || prodName.includes('apio') || prodName.includes('platano')) vegetales += qty;
        else if (catName.includes('carne') || catName.includes('proteína') || prodName.includes('pollo')) proteinas += qty;
        else otros += qty;
      });

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