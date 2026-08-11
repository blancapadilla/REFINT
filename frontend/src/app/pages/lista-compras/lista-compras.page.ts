import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import {
  ComprasService,
  ItemCompra,
  CategoriaCompra
} from 'src/app/services/compras.service';

import { addIcons } from 'ionicons';
import {
  settingsOutline,
  searchOutline,
  sparklesOutline,
  trendingDownOutline,
  leafOutline,
  waterOutline,
  nutritionOutline,
  addOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline,
  notificationsOutline,
  trashOutline,
  checkmarkOutline,
  pricetagOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.page.html',
  styleUrls: ['./lista-compras.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class ListaComprasPage implements OnInit {

  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  sparklesOutline = sparklesOutline;
  trendingDownOutline = trendingDownOutline;
  leafOutline = leafOutline;
  waterOutline = waterOutline;
  nutritionOutline = nutritionOutline;
  addOutline = addOutline;
  trashOutline = trashOutline;
  checkmarkOutline = checkmarkOutline;
  pricetagOutline = pricetagOutline;

  categorias: CategoriaCompra[] = [];
  ahorroProyectado = '20%';
  cargando = true;
  error = '';

  modalAgregarAbierto = false;
  nuevoProductoNombre = '';
  guardandoItem = false;

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: true },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private comprasService: ComprasService,
    private toastCtrl: ToastController
  ) {
    addIcons({
      trashOutline,
      checkmarkOutline,
      pricetagOutline,
      settingsOutline,
      searchOutline,
      sparklesOutline,
      trendingDownOutline,
      leafOutline,
      waterOutline,
      nutritionOutline,
      addOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline,
      notificationsOutline
    });
  }

  ngOnInit() {
    this.cargarLista();
  }

  ionViewWillEnter() {
    this.cargarLista();
  }

  async cargarLista() {
    this.cargando = true;
    this.error = '';

    try {
      const res = await this.comprasService.getListaCompras();
      this.categorias = res.categorias;
      this.ahorroProyectado = res.estadisticas.ahorro_proyectado;
    } catch (error) {
      console.error('Error cargando lista de compras:', error);
      this.error = 'No se pudo cargar la lista de compras.';
      this.categorias = [];
    } finally {
      this.cargando = false;
    }
  }

  async toggleItem(item: ItemCompra) {
    const estadoAnterior = item.marcado;
    item.marcado = !item.marcado;

    try {
      await this.comprasService.toggleItem(item.id);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      item.marcado = estadoAnterior;
      await this.mostrarToast('No se pudo actualizar el estado del producto.', 'danger');
    }
  }

  async generarListaAutomatica() {
    try {
      this.cargando = true;
      const totalAgregados = await this.comprasService.generarListaAutomatica();
      await this.cargarLista();

      if (totalAgregados > 0) {
        await this.mostrarToast(`Se agregaron ${totalAgregados} producto(s) faltantes automáticamente.`, 'success');
      } else {
        await this.mostrarToast('Tu inventario está completo. No hay productos pendientes.', 'success');
      }
    } catch (e) {
      console.error('Error al generar lista automática:', e);
      await this.mostrarToast('Ocurrió un error al generar la lista.', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  agregarItem() {
    this.nuevoProductoNombre = '';
    this.modalAgregarAbierto = true;
  }

  cerrarModal() {
    this.modalAgregarAbierto = false;
  }

  async confirmarAgregarManual() {
    if (!this.nuevoProductoNombre.trim()) return;

    this.guardandoItem = true;
    try {
      await this.comprasService.agregarItemManual(this.nuevoProductoNombre);
      this.cerrarModal();
      await this.cargarLista();
    } catch (e) {
      console.error('Error agregando item manual:', e);
      await this.mostrarToast('No se pudo agregar el producto.', 'danger');
    } finally {
      this.guardandoItem = false;
    }
  }

  async eliminarDeLista(item: ItemCompra, event: Event) {
    event.stopPropagation();

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      await this.comprasService.eliminarItem(item.id);
      await this.cargarLista();
    } catch (error) {
      console.error('Error al eliminar:', error);
      await this.mostrarToast('No se pudo eliminar el producto.', 'danger');
    }
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

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  buscar() {
    console.log('Buscar en lista de compras');
  }

  navegar(item: any) {
    this.bottomNavItems = this.bottomNavItems.map(nav => ({
      ...nav,
      active: nav.id === item.id
    }));

    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}