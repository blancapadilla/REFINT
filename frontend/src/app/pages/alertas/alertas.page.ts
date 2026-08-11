import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { SupabaseService } from '../../services/supabase';
import { RefrigeradorService } from '../../services/refrigerador.service';
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
  notifications
} from 'ionicons/icons';
import { ComprasService } from 'src/app/services/compras.service';

export interface NotificacionAlert {
  id: string;
  tipo: 'critical' | 'warning' | 'low_stock' | 'info';
  icono: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leido: boolean;
  porcentajeExpirado?: number;
  productoId?: string;
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

  alertCircleOutline = alertCircleOutline;
  timeOutline = timeOutline;
  checkmarkCircleOutline = checkmarkCircleOutline;
  
bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notifications, path: '/alertas', active: true }
  ];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private supabaseService: SupabaseService,
    private refrigeradorService: RefrigeradorService,
    private toastCtrl: ToastController,
    private comprasService: ComprasService
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
      const fridge = await this.refrigeradorService.getMiRefrigerador();
      if (!fridge) return;

      const { data: productos, error } = await this.supabaseService.client
        .from('v_inventory_current')
        .select('*')
        .eq('refrigerator_id', fridge.id)
        .in('status', ['agotado', 'caducado', 'proximo_a_caducar', 'bajo']);

      if (error) throw error;

      let criticas = 0;
      let proximos = 0;
      const items: NotificacionAlert[] = [];

      (productos || []).forEach((prod: any) => {
        const dias = prod.days_to_expiry != null ? Number(prod.days_to_expiry) : null;
        const cantidad = Number(prod.quantity ?? 0);

        // 1. PRODUCTO AGOTADO
        if (prod.status === 'agotado' || cantidad <= 0) {
          criticas++;
          items.push({
            id: `agotado-${prod.id}`,
            tipo: 'critical',
            icono: closeCircleOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: `El producto está completamente agotado. No quedan existencias en el compartimiento.`,
            tiempo: 'Reciente',
            leido: false,
            productoId: prod.product_id
          });
        } 
        
        // 2. PRODUCTO CADUCADO (Prioridad: Días negativos O status 'caducado')
        else if (prod.status === 'caducado' || (dias !== null && dias < 0)) {
          criticas++;
          const diasPasados = Math.abs(dias || 0);
          items.push({
            id: `caducado-${prod.id}`,
            tipo: 'critical',
            icono: alertCircleOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: `Caducó hace ${diasPasados} día(s). Se recomienda desecharlo inmediatamente.`,
            tiempo: 'Hace unas horas',
            porcentajeExpirado: 100, // Barra roja completa
            leido: false,
            productoId: prod.product_id
          });
        } 
        
        // 3. PRÓXIMO A CADUCAR (Días >= 0 dentro del rango)
        else if (prod.status === 'proximo_a_caducar' || (dias !== null && dias >= 0 && dias <= 3)) {
          proximos++;
          const porcentaje = Math.max(10, 100 - ((dias || 0) * 20));
          items.push({
            id: `vencer-${prod.id}`,
            tipo: 'warning',
            icono: timeOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: dias === 0 ? 'Vence HOY. Úsalo en tus recetas cuanto antes.' : `Vence en ${dias} día(s). Se recomienda consumir pronto.`,
            tiempo: 'Hace 1 hora',
            porcentajeExpirado: Math.round(porcentaje),
            leido: false,
            productoId: prod.product_id
          });
        } 
        
        // 4. STOCK BAJO
        else if (prod.status === 'bajo') {
          proximos++;
          items.push({
            id: `bajo-${prod.id}`,
            tipo: 'low_stock',
            icono: basketOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: `Quedan solo ${prod.quantity} ${prod.unit}. Tu consumo indica que necesitarás más en unos días.`,
            tiempo: 'Hace 3 horas',
            leido: false,
            productoId: prod.product_id
          });
        }
      });

      // Tarjeta de estado de sincronización
      items.push({
        id: 'sync-status',
        tipo: 'info',
        icono: cloudDoneOutline,
        titulo: 'Inventario Sincronizado',
        descripcion: 'Se han actualizado los artículos correctamente después de tu última revisión al supermercado.',
        tiempo: 'Hoy, 08:45 AM',
        leido: false
      });

      this.totalCriticas = criticas;
      this.totalProximos = proximos;
      this.notificaciones = items;

    } catch (err) {
      console.error('Error al cargar alertas:', err);
    } finally {
      this.cargando = false;
    }
  }

  // ==========================================================
  // MANEJO DE ACCIONES
  // ==========================================================

  async marcarTodoComoLeido() {
    this.notificaciones = [];
    this.totalCriticas = 0;
    this.totalProximos = 0;
    await this.mostrarToast('Todas las alertas marcadas como leídas.', 'success');
  }

  async omitirNotificacion(id: string) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    this.totalCriticas = this.notificaciones.filter(n => n.tipo === 'critical').length;
    this.totalProximos = this.notificaciones.filter(n => n.tipo === 'warning' || n.tipo === 'low_stock').length;
    await this.mostrarToast('Alerta omitida.', 'warning');
  }

  async anadirAListaCompras(notif: NotificacionAlert) {
    if (!notif.productoId) return;

    try {
      await this.comprasService.agregarOActualizarItemByProductId(notif.productoId);
      this.notificaciones = this.notificaciones.filter(n => n.id !== notif.id);
      this.totalCriticas = this.notificaciones.filter(n => n.tipo === 'critical').length;
      this.totalProximos = this.notificaciones.filter(n => n.tipo === 'warning' || n.tipo === 'low_stock').length;
      await this.mostrarToast(`"${notif.titulo}" añadido a la lista de compras.`, 'success');
    } catch (e) {
      console.error(e);
      await this.mostrarToast('No se pudo añadir el producto.', 'danger');
    }
  }

  filtrarPor(tipo: string) {}

  irA(path: string) {
    this.router.navigate([path]);
  }

  navegar(nav: any) {
    this.router.navigate([nav.path]);
  }

  // ==========================================================
  // TOAST ESTANDARIZADO (COMO EN COMPARACIÓN)
  // ==========================================================
  private async mostrarToast(
    mensaje: string,
    color: 'success' | 'danger' | 'warning' | 'dark' = 'dark'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color,
      position: 'top'
    });
    await toast.present();
  }
}