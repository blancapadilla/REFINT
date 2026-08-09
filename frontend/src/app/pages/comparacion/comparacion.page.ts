import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonicModule, ToastController } from '@ionic/angular';
import { RealtimeChannel } from '@supabase/supabase-js';
import { addIcons } from 'ionicons';
import {
  cartOutline, checkmarkCircleOutline, closeCircleOutline, cubeOutline,
  imageOutline, notificationsOutline, syncOutline, timeOutline, warningOutline
} from 'ionicons/icons';
import { RefrigeradorService } from '../../services/refrigerador.service';
import { Scan, ScanChange, ScanChangeType, SyncService } from '../../services/sync.service';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

type ViewState = 'loading' | 'empty' | 'no-changes' | 'error' | 'success';

@Component({
  selector: 'app-comparacion',
  templateUrl: './comparacion.page.html',
  styleUrls: ['./comparacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent]
})
export class ComparacionPage implements OnInit, OnDestroy {
  readonly checkmarkCircleOutline = checkmarkCircleOutline;
  readonly warningOutline = warningOutline;
  readonly closeCircleOutline = closeCircleOutline;
  readonly imageOutline = imageOutline;
  readonly timeOutline = timeOutline;

  state: ViewState = 'loading';
  scan: Scan | null = null;
  changes: ScanChange[] = [];
  confirming = false;
  private refrigeratorId: string | null = null;
  private scansChannel: RealtimeChannel | null = null;

  readonly bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: true },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private readonly router: Router,
    private readonly syncService: SyncService,
    private readonly refrigeradorService: RefrigeradorService,
    private readonly alertController: AlertController,
    private readonly toastController: ToastController
  ) {
    addIcons({ cartOutline, checkmarkCircleOutline, closeCircleOutline, cubeOutline,
      imageOutline, notificationsOutline, syncOutline, timeOutline, warningOutline });
  }

  ngOnInit(): void {
    void this.initialize();
  }

  ngOnDestroy(): void {
    if (this.scansChannel) void this.syncService.unsubscribe(this.scansChannel);
  }

  private async initialize(): Promise<void> {
    try {
      const refrigerator = await this.refrigeradorService.getMiRefrigerador();
      if (!refrigerator) {
        this.state = 'empty';
        return;
      }
      this.refrigeratorId = refrigerator.id;
      await this.loadResults();
      this.scansChannel = this.syncService.subscribeToCompletedScans(
        refrigerator.id,
        () => void this.loadResults(false)
      );
    } catch (error) {
      this.handleLoadError(error);
    }
  }

  async loadResults(showLoading = true): Promise<void> {
    if (!this.refrigeratorId) return;
    if (showLoading) this.state = 'loading';
    try {
      this.scan = await this.syncService.getLatestCompletedScan(this.refrigeratorId);
      if (!this.scan) {
        this.changes = [];
        this.state = 'empty';
        return;
      }
      this.changes = await this.syncService.getScanChanges(this.scan.id);
      this.state = this.changes.length ? 'success' : 'no-changes';
    } catch (error) {
      this.handleLoadError(error);
    }
  }

  private handleLoadError(error: unknown): void {
    console.error('Error al cargar la comparación desde Supabase:', error);
    this.state = 'error';
  }

  get summary(): { unchanged: number; added: number; removed: number } {
    return {
      unchanged: this.changes.filter(change => change.difference === 0).length,
      added: this.changes.filter(change => change.difference > 0).length,
      removed: this.changes.filter(change => change.difference < 0).length
    };
  }

  get alreadyConfirmed(): boolean {
    return this.changes.length > 0 && this.changes.every(change =>
      change.confirmation_status?.toLowerCase() === 'accepted'
    );
  }

  formatDifference(change: ScanChange): string {
    if (change.difference === 0) return 'Sin cambios';
    return `${change.difference > 0 ? '+' : ''}${change.difference} ${change.unit}`;
  }

  changeTypeLabel(type: ScanChangeType): string {
    const labels: Record<ScanChangeType, string> = {
      added: 'Agregado', removed: 'Retirado',
      quantity_changed: 'Cantidad modificada', unchanged: 'Sin cambios'
    };
    return labels[type];
  }

  imageUrl(change: ScanChange): string | null {
    const path = change.products?.image_path;
    return path && /^https?:\/\//i.test(path) ? path : null;
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(value));
  }

  formatProcessing(ms: number | null): string {
    return ms === null ? 'Tiempo no disponible' : `Procesado en ${(ms / 1000).toLocaleString('es-MX', { maximumFractionDigits: 2 })} s`;
  }

  async confirmChanges(): Promise<void> {
    if (!this.scan || this.confirming || this.alreadyConfirmed) return;
    const alert = await this.alertController.create({
      header: '¿Confirmar los cambios detectados?',
      message: 'El inventario será actualizado con los resultados de este análisis.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar', role: 'confirm', handler: () => void this.applyChanges() }
      ]
    });
    await alert.present();
  }

  private async applyChanges(): Promise<void> {
    if (!this.scan) return;
    this.confirming = true;
    try {
      await this.syncService.applyScanChanges(this.scan.id);
      await this.loadResults(false);
      await this.showToast('Cambios confirmados correctamente.', 'success');
    } catch (error) {
      console.error('Error al confirmar los cambios mediante apply_scan_changes:', error);
      await this.showToast('No fue posible confirmar los cambios.', 'danger');
    } finally {
      this.confirming = false;
    }
  }

  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 2500, color, position: 'top' });
    await toast.present();
  }

  buscar(): void { /* El encabezado conserva la acción existente. */ }
  navegar(item: { path: string }): void { void this.router.navigate([item.path]); }
}
