import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { HardwareCommand, HardwareService } from '../../services/hardware.service';
import { RefrigeradorService } from '../../services/refrigerador.service';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircleOutline, hardwareChipOutline, snowOutline } from 'ionicons/icons';

@Component({
  selector: 'app-escaneo-inteligente',
  templateUrl: './escaneo-inteligente.page.html',
  styleUrls: ['./escaneo-inteligente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class EscaneoInteligentePage implements OnDestroy {
  scanStatus = 'Listo para escanear.';
  scanLog: Array<{ icon: string; text: string }> = [];
  scanStarted = false;
  resultsReady = false;
  errorMessage = '';
  private commandChannel: RealtimeChannel | null = null;

  constructor(
    private router: Router,
    private hardwareService: HardwareService,
    private refrigeradorService: RefrigeradorService
  ) {
    addIcons({ cameraOutline, checkmarkCircleOutline, hardwareChipOutline, snowOutline });
  }

  async iniciarEscaneo() {
    if (this.scanStarted) return;
    this.scanStarted = true;
    this.resultsReady = false;
    this.errorMessage = '';
    this.scanStatus = 'Enviando orden a la laptop...';
    this.scanLog = [{ icon: 'hardware-chip-outline', text: 'Orden de escaneo creada' }];

    try {
      const refrigerator = await this.refrigeradorService.getMiRefrigerador();
      if (!refrigerator) throw new Error('No hay un refrigerador registrado.');
      const command = await this.hardwareService.requestScan(refrigerator.id);
      this.commandChannel = this.hardwareService.subscribeToCommand(
        command.id,
        update => this.actualizarEstado(update)
      );
      this.scanStatus = 'Esperando que la laptop tome la fotografía...';
    } catch (error: any) {
      this.scanStarted = false;
      this.errorMessage = error?.message ?? 'No se pudo solicitar el escaneo.';
      this.scanStatus = 'Error al solicitar el escaneo.';
    }
  }

  private actualizarEstado(command: HardwareCommand) {
    if (command.status === 'processing') {
      this.scanStatus = 'Fotografía tomada. Analizando con IA...';
      this.scanLog.unshift({ icon: 'camera-outline', text: 'La laptop inició el escaneo' });
    } else if (command.status === 'completed') {
      this.scanStatus = 'Escaneo completado. Revisa los cambios.';
      this.scanLog.unshift({ icon: 'checkmark-circle-outline', text: 'IA e inventario procesados' });
      this.resultsReady = true;
      this.scanStarted = false;
    } else if (command.status === 'failed') {
      this.scanStatus = 'El escaneo falló.';
      this.errorMessage = command.error_message || 'Revisa el proceso Python en la laptop.';
      this.scanStarted = false;
    }
  }

  confirmarCambios() {
    if (this.resultsReady) this.router.navigate(['/comparacion']);
  }

  ngOnDestroy() {
    if (this.commandChannel) void this.hardwareService.unsubscribe(this.commandChannel);
  }
}
