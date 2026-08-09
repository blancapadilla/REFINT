import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { DashboardService, DeviceStatus } from '../../services/dashboard.service';
import { RefrigeradorService, Refrigerador } from '../../services/refrigerador.service';
import { ConfiguracionService } from '../../services/configuracion.service';

@Component({
  selector: 'app-estado-sistema',
  templateUrl: './estado-sistema.page.html',
  styleUrls: ['./estado-sistema.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class EstadoSistemaPage implements OnInit {
  systemStatus = 'Operational';
  networkStatus = 'Low Signal';
  supabaseHealthy = false;
  backendHealthy = false;
  refrigerador: Refrigerador | null = null;
  deviceStatuses: DeviceStatus[] = [];
  firmwareVersion = 'N/A';
  ipAddress = 'N/A';
  uptime = 'N/A';

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private refrigeradorService: RefrigeradorService,
    private configuracionService: ConfiguracionService
  ) {}

  ngOnInit() {
    this.loadSystemStatus();
  }

  async loadSystemStatus() {
    try {
      const [refrigerador, devices, supabaseHealthy, backendHealthy] = await Promise.all([
        this.refrigeradorService.getMiRefrigerador(),
        this.dashboardService.getDeviceStatuses(),
        this.dashboardService.checkSupabaseHealth(),
        this.configuracionService.checkBackendApi()
      ]);

      this.refrigerador = refrigerador;
      this.deviceStatuses = devices;
      this.supabaseHealthy = supabaseHealthy;
      this.backendHealthy = backendHealthy;

      const thermistor = devices.find((d: DeviceStatus) => d.type === 'temperature_sensor');
      const doorSensor = devices.find((d: DeviceStatus) => d.type === 'door_sensor' || d.type === 'sensor');
      const esp32 = devices.find((d: DeviceStatus) => d.type === 'esp32');

      if (esp32) {
        this.firmwareVersion = esp32.firmware ?? 'N/A';
        this.ipAddress = esp32.ip_address ?? 'N/A';
        this.uptime = esp32.uptime_seconds != null ? this.formatUptime(esp32.uptime_seconds) : 'N/A';
      } else if (thermistor) {
        this.firmwareVersion = thermistor.firmware ?? 'N/A';
      }

      this.systemStatus = devices.some((d: DeviceStatus) => d.status !== 'online') ? 'Degraded' : 'System Operational';
      this.networkStatus = devices.some((d: DeviceStatus) => d.wifi_rssi != null && d.wifi_rssi < -70) ? 'Low Signal' : 'Healthy';
    } catch (error) {
      console.error('Error cargando estado del sistema:', error);
    }
  }

  getDeviceIcon(type: string): string {
    switch (type) {
      case 'esp32':
      case 'hardware_chip':
        return 'hardware-chip-outline';
      case 'temperature_sensor':
      case 'thermistor':
        return 'thermometer-outline';
      case 'door_sensor':
      case 'sensor':
      case 'magnetic_contact':
        return 'door-open-outline';
      case 'camera':
      case 'vision_module':
        return 'camera-outline';
      default:
        return 'help-circle-outline';
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }
}
