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
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, active: false, path: '/inventario' },
    { id: 'shopping', label: 'Lista de compras', icon: cartOutline, active: false, path: '/lista-compras' },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, active: false, path: '/comparacion' },
    { id: 'history', label: 'Historial', icon: timeOutline, active: false, path: '/historial' },
    { id: 'alerts', label: 'Alertas', icon: notifications, active: true, path: '/alertas' }
  ];

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private supabaseService: SupabaseService,
    private refrigeradorService: RefrigeradorService,
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
      // 1. Obtenemos el refrigerador actual
      const fridge = await this.refrigeradorService.getMiRefrigerador();
      if (!fridge) return;

      // 2. Extraemos el inventario vivo, filtrando solo lo que requiere atención
      const { data: productos, error } = await this.supabaseService.client
        .from('v_inventory_current')
        .select('*')
        .eq('refrigerator_id', fridge.id)
        .in('status', ['agotado', 'caducado', 'proximo_a_caducar', 'bajo']);

      if (error) throw error;

      let criticas = 0;
      let proximos = 0;
      const items: NotificacionAlert[] = [];

      // 3. Mapeamos las alertas dinámicamente según su estado
      (productos || []).forEach((prod: any) => {
        
        if (prod.status === 'agotado') {
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
        
        else if (prod.status === 'caducado') {
          criticas++;
          const dias = Math.abs(prod.days_to_expiry || 0);
          items.push({
            id: `caducado-${prod.id}`,
            tipo: 'critical',
            icono: alertCircleOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: `Caducó hace ${dias} día(s). Se recomienda desecharlo inmediatamente.`,
            tiempo: 'Hace unas horas',
            porcentajeExpirado: 100, // Barra al máximo
            leido: false,
            productoId: prod.product_id
          });
        } 
        
        else if (prod.status === 'proximo_a_caducar') {
          proximos++;
          const dias = prod.days_to_expiry || 0;
          const porcentaje = Math.max(10, 100 - (dias * 20)); // Cálculo del progreso de la barra
          items.push({
            id: `vencer-${prod.id}`,
            tipo: 'warning',
            icono: timeOutline,
            titulo: `${prod.product_name || 'Producto'}`,
            descripcion: dias === 0 ? 'Vence HOY. Úsalo en tus recetas cuanto antes.' : `Vence en ${dias} día(s). Se recomienda consumir pronto.`,
            tiempo: 'Hace 1 hora',
            porcentajeExpirado: Math.round(porcentaje), // Asignamos la barra a la alerta naranja
            leido: false,
            productoId: prod.product_id
          });
        } 
        
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

      // 4. Agregamos la tarjeta verde de sistema (Inventario Sincronizado)
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
    this.mostrarToast('Todas las alertas han sido marcadas como leídas.');
  }

  async omitirNotificacion(id: string) {
    this.notificaciones = this.notificaciones.filter(n => n.id !== id);
    
    // Recalculamos los totales dinámicamente
    this.totalCriticas = this.notificaciones.filter(n => n.tipo === 'critical').length;
    this.totalProximos = this.notificaciones.filter(n => n.tipo === 'warning' || n.tipo === 'low_stock').length;
    
    this.mostrarToast('Alerta omitida.');
  }

  async anadirAListaCompras(notif: NotificacionAlert) {
    if (!notif.productoId) return;
    
    try {
      const fridge = await this.refrigeradorService.getMiRefrigerador();
      if (!fridge) return;

      // Buscar si el usuario tiene una lista de compras activa
      const { data: listas } = await this.supabaseService.client
        .from('shopping_lists')
        .select('id')
        .eq('refrigerator_id', fridge.id)
        .eq('status', 'active')
        .limit(1);

      if (listas && listas.length > 0) {
         // Realizar un upsert directo para añadir a la base de datos
         await this.supabaseService.client
          .from('shopping_list_items')
          .upsert({
             shopping_list_id: listas[0].id,
             product_id: notif.productoId,
             desired_quantity: 1,
             is_auto_generated: true
          });
      }

      // Quitamos la alerta visualmente
      this.omitirNotificacion(notif.id);
      this.mostrarToast(`"${notif.titulo}" añadido a la lista de compras.`);

    } catch(e) {
      console.error('Error al añadir a lista de compras:', e);
    }
  }

  filtrarPor(tipo: string) {
    // Opción para saltar al filtro si tocan la tarjeta superior
  }

  irA(path: string) {
    this.router.navigate([path]);
  }

  navegar(nav: any) {
    this.router.navigate([nav.path]);
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