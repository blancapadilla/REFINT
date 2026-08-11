import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import {
  DashboardService,
  WeeklyTrendItem
} from '../../services/dashboard.service';
import { InventarioService } from '../../services/inventario.service';

interface StatCard {
  label: string;
  value: string;
  note: string;
}

interface TrendPoint {
  day: string;
  count: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class EstadisticasPage implements OnInit {

  metrics: StatCard[] = [
    {
      label: 'Escaneos',
      value: '0',
      note: '+0% vs mes anterior'
    },
    {
      label: 'Temp. Promedio',
      value: '0°C',
      note: 'Óptimo'
    },
    {
      label: 'Ahorro Est.',
      value: '$0.00',
      note: 'Basado en inventario'
    },
    {
      label: 'Desperdicio',
      value: '0%',
      note: 'Items caducados'
    }
  ];

  trendData: WeeklyTrendItem[] = [];
  trendPoints: TrendPoint[] = [];

  topProducts: Array<{
    name: string;
    quantity: number;
  }> = [];

  expiryCounts = {
    fresh: 0,
    soon: 0,
    critical: 0
  };

  maxProductQuantity = 1;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  async loadStatistics(): Promise<void> {
    try {
      const [
        scanCount,
        avgTemp,
        savings,
        statusCounts,
        topProducts,
        trendData
      ] = await Promise.all([
        this.dashboardService.getCompletedScanCount(),
        this.dashboardService.getAverageFridgeTemperature(),
        this.dashboardService.getSavingsEstimate(),
        this.inventarioService.getInventoryStatusCounts(),
        this.inventarioService.getTopProducts(5),
        this.dashboardService.getWeeklyScanTrend(7)
      ]);

      /*
       * TARJETAS PRINCIPALES
       */
      this.metrics = [
        {
          label: 'Escaneos',
          value: scanCount.toString(),
          note: '+12% vs mes anterior'
        },
        {
          label: 'Temp. Promedio',
          value: `${avgTemp.toFixed(1)}°C`,
          note: avgTemp >= 0 ? 'Óptimo' : 'No disponible'
        },
        {
          label: 'Ahorro Est.',
          value: `$${savings.toFixed(2)}`,
          note: 'Basado en inventario'
        },
        {
          label: 'Desperdicio',
          value:
            statusCounts.total > 0
              ? `${Math.round((statusCounts.expired / statusCounts.total) * 100)}%`
              : '0%',
          note: `${statusCounts.expired} caducados`
        }
      ];

      /*
       * TENDENCIA SEMANAL
       */
      this.trendData = trendData;
      this.prepareTrendPoints();

      /*
       * PRODUCTOS MÁS CONSUMIDOS
       */
      this.topProducts = topProducts;
      this.maxProductQuantity = Math.max(
        1,
        ...topProducts.map(product => product.quantity)
      );

      /*
       * CADUCIDAD
       */
      this.expiryCounts = {
        fresh: statusCounts.fresh,
        soon: statusCounts.soon,
        critical: statusCounts.critical
      };

    } catch (error) {
      console.error('Error cargando datos de estadísticas:', error);
    }
  }

  /*
   * Prepara los puntos para la gráfica SVG
   */
  prepareTrendPoints(): void {
    if (!this.trendData.length) {
      this.trendPoints = [];
      return;
    }

    const max = Math.max(1, ...this.trendData.map(item => item.count));
    const total = this.trendData.length;

    this.trendPoints = this.trendData.map((item, index) => {
      const x = total === 1 ? 50 : 5 + (index / (total - 1)) * 90;
      const y = 90 - (item.count / max) * 70;

      return {
        day: item.day,
        count: item.count,
        x,
        y
      };
    });
  }

  /*
   * Puntos para el elemento <polyline> del SVG
   */
  getTrendSvgPoints(): string {
    return this.trendPoints.map(point => `${point.x},${point.y}`).join(' ');
  }

  /*
   * Porcentaje de cada estado de caducidad
   */
  getExpiryPercentage(value: number): number {
    const total =
      this.expiryCounts.fresh +
      this.expiryCounts.soon +
      this.expiryCounts.critical;

    if (total === 0) {
      return 0;
    }

    return (value / total) * 100;
  }

  /*
   * Gradiente cónico para el gráfico de dona
   */
  getDonutBackground(): string {
    const total =
      this.expiryCounts.fresh +
      this.expiryCounts.soon +
      this.expiryCounts.critical;

    // Si no hay productos, mostrar un aro gris neutro en lugar de rojo
    if (total === 0) {
      return 'conic-gradient(#e2e8f0 0% 100%)';
    }

    const fresh = this.getExpiryPercentage(this.expiryCounts.fresh);
    const soon = this.getExpiryPercentage(this.expiryCounts.soon);

    const freshEnd = fresh;
    const soonEnd = fresh + soon;

    return `
      conic-gradient(
        #007e37 0% ${freshEnd}%,
        #0060ac ${freshEnd}% ${soonEnd}%,
        #ba1a1a ${soonEnd}% 100%
      )
    `;
  }

  /*
   * Recorte de nombre para evitar desbordamiento en la gráfica
   */
  shortProductName(name: string): string {
    if (!name) {
      return 'Producto';
    }

    if (name.length <= 12) {
      return name;
    }

    return name.substring(0, 11) + '...';
  }

  irAConfig(): void {
    this.router.navigate(['/configuracion']);
  }
}