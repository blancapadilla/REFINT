import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DashboardService, WeeklyTrendItem } from '../../services/dashboard.service';
import { InventarioService } from '../../services/inventario.service';

interface StatCard {
  label: string;
  value: string;
  note: string;
}

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class EstadisticasPage implements OnInit {
  metrics: StatCard[] = [
    { label: 'Escaneos', value: '0', note: '+0% vs mes anterior' },
    { label: 'Temp. Promedio', value: '0°C', note: 'Óptimo' },
    { label: 'Ahorro Est.', value: '$0.00', note: 'Basado en inventario' },
    { label: 'Desperdicio', value: '0%', note: 'Items caducados' }
  ];

  trendData: WeeklyTrendItem[] = [];
  topProducts: Array<{ name: string; quantity: number }> = [];
  expiryCounts = { fresh: 0, soon: 0, critical: 0 };
  maxProductQuantity = 1;

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit() {
    this.loadStatistics();
  }

  async loadStatistics() {
    try {
      const [scanCount, avgTemp, savings, statusCounts, topProducts, trendData] = await Promise.all([
        this.dashboardService.getCompletedScanCount(),
        this.dashboardService.getAverageFridgeTemperature(),
        this.dashboardService.getSavingsEstimate(),
        this.inventarioService.getInventoryStatusCounts(),
        this.inventarioService.getTopProducts(5),
        this.dashboardService.getWeeklyScanTrend(7)
      ]);

      this.metrics = [
        { label: 'Escaneos', value: scanCount.toString(), note: `${scanCount >= 0 ? '+12% vs mes anterior' : ''}` },
        { label: 'Temp. Promedio', value: `${avgTemp.toFixed(1)}°C`, note: avgTemp >= 0 ? 'Óptimo' : 'No disponible' },
        { label: 'Ahorro Est.', value: `$${savings.toFixed(2)}`, note: 'Basado en inventario' },
        {
          label: 'Desperdicio',
          value: statusCounts.total > 0 ? `${Math.round((statusCounts.expired / statusCounts.total) * 100)}%` : '0%',
          note: `${statusCounts.expired} caducados`
        }
      ];

      this.trendData = trendData;
      this.topProducts = topProducts;
      this.expiryCounts = {
        fresh: statusCounts.fresh,
        soon: statusCounts.soon,
        critical: statusCounts.critical
      };
      this.maxProductQuantity = Math.max(1, ...topProducts.map(p => p.quantity));
    } catch (error) {
      console.error('Error cargando datos de estadísticas:', error);
    }
  }

  irAConfig() {
    this.router.navigate(['/configuracion']);
  }
}
