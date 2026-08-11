import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { SupabaseService } from '../../services/supabase';
import { addIcons } from 'ionicons';
import { 
  alertCircleOutline, 
  timeOutline, 
  closeCircleOutline, 
  basketOutline, 
  cloudDoneOutline, 
  checkmarkCircleOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  notifications, 
} from 'ionicons/icons';

export interface NotificacionAlert {
  id: string;
  tipo: 'critical' | 'warning' | 'low_stock' | 'info';
  icono: any;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leido: boolean;
  porcentajeExpirado?: number;
  relatedEntityId?: string;
}

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class AlertasPage implements OnInit {
  cargando = true;
  notificaciones: NotificacionAlert[] = [];
  
  totalCriticas = 0;
  totalProximos = 0;

  // Iconos Ionic
  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;
  checkmarkCircleOutline = checkmarkCircleOutline;

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, active: false, path: '/inventario' },
    { id: 'shopping', label: 'Lista', icon: cartOutline, active: false, path: '/lista-compras' },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, active: false, path: '/comparacion' },
    { id: 'history', label: 'Historial', icon: timeOutline, active: false, path: '/historial' },
    { id: 'alerts', label: 'Alertas', icon: notifications, active: true, path: '/alertas' }
  ];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private supabaseService: SupabaseService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      alertCircleOutline,
      timeOutline,
      closeCircleOutline,
      basketOutline,
      cloudDoneOutline,
      checkmarkCircleOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      historyIcon: timeOutline,
      notifications
    });
  }

  ngOnInit() {
    this.cargarAlertas();
  }

  ionViewWillEnter() {
    this.cargarAlertas();
  }

  async cargarAlertas() {
    this.cargando = true;
    try {
      // 1. Consultar directamente la tabla 'alerts' de Supabase
      const { data: dbAlerts, error } = await this.supabaseService.client
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let criticas = 0;
      let proximos = 0;

      const mappedAlerts: NotificacionAlert[] = (dbAlerts || []).map((alt: any) => {
        let tipoUI: 'critical' | 'warning' | 'low_stock' | 'info' = 'warning';
        let iconoUI = timeOutline;

        // Mapeo según el tipo y severidad almacenados en Supabase
        if (alt.severity === 'critical' || alt.type === 'product_out_of_stock') {
          tipoUI = 'critical';
          iconoUI = closeCircleOutline;
          criticas++;
        } else if (alt.type === 'expiring_product') {
          tipoUI = 'warning';
          iconoUI = timeOutline;
          proximos++;
        } else if (alt.type === 'low_stock') {
          tipoUI = 'low_stock';
          iconoUI = basketOutline;
        }

        return {
          id: alt.id,
          tipo: tipoUI,
          icono: iconoUI,
          titulo: alt.title || 'Alerta de Inventario',
          descripcion: alt.message || '',
          tiempo: this.calcularTiempoRelativo(alt.created_at),
          leido: alt.is_read || false,
          relatedEntityId: alt.related_entity_id
        };
      });

      this.totalCriticas = criticas;
      this.totalProximos = proximos;
      this.notificaciones = mappedAlerts;

    } catch (err) {
      console.error('Error al cargar alertas desde Supabase:', err);
    } finally {
      this.cargando = false;
    }
  }

  async marcarTodoComoLeido() {
    try {
      await this.supabaseService.client
        .from('alerts')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('is_read', false);

      this.notificaciones.forEach(n => n.leido = true);
      this.mostrarToast('Todas las alertas han sido marcadas como leídas.');
    } catch (e) {
      console.error('Error marcando alertas como leídas:', e);
    }
  }

  async omitirNotificacion(id: string) {
    try {
      await this.supabaseService.client
        .from('alerts')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', id);

      this.notificaciones = this.notificaciones.filter(n => n.id !== id);
      this.mostrarToast('Alerta omitida.');
    } catch (e) {
      console.error('Error al omitir alerta:', e);
    }
  }

  async anadirAListaCompras(notif: NotificacionAlert) {
    this.mostrarToast(`Añadido a la lista de compras.`);
  }

  filtrarPor(tipo: string) {
    // Lógica opcional de filtrado
  }

  irA(path: string) {
    this.router.navigate([path]);
  }

  navegar(nav: any) {
    this.router.navigate([nav.path]);
  }

  private calcularTiempoRelativo(fechaStr: string): string {
    if (!fechaStr) return 'Hace un momento';
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMs / (1000 * 3600));
    const diffDias = Math.floor(diffMs / (1000 * 3600 * 24));

    if (diffMins < 60) return `Hace ${Math.max(1, diffMins)} min`;
    if (diffHoras < 24) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'dark'
    });
    toast.present();
  }
}