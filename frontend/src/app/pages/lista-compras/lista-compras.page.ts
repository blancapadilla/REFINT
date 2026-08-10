import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
  notificationsOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.page.html',
  styleUrls: ['./lista-compras.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent
  ]
})
export class ListaComprasPage implements OnInit {

  // ==========================================
  // ICONOS
  // ==========================================

  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  sparklesOutline = sparklesOutline;
  trendingDownOutline = trendingDownOutline;
  leafOutline = leafOutline;
  waterOutline = waterOutline;
  nutritionOutline = nutritionOutline;
  addOutline = addOutline;

  // ==========================================
  // DATOS
  // ==========================================

  categorias: CategoriaCompra[] = [];

  ahorroProyectado = '20%';

  cargando = true;

  error = '';

  // ==========================================
  // MENÚ INFERIOR
  // ==========================================

  bottomNavItems = [
    {
      id: 'inventory',
      label: 'Inventario',
      icon: cubeOutline,
      path: '/inventario',
      active: false
    },
    {
      id: 'shopping',
      label: 'Lista de Compras',
      icon: cartOutline,
      path: '/lista-compras',
      active: true
    },
    {
      id: 'sync',
      label: 'Sincronizar',
      icon: syncOutline,
      path: '/comparacion',
      active: false
    },
    {
      id: 'history',
      label: 'Historial',
      icon: timeOutline,
      path: '/historial',
      active: false
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: notificationsOutline,
      path: '/alertas',
      active: false
    }
  ];

  constructor(
    private router: Router,
    private comprasService: ComprasService
  ) {

    addIcons({
      settingsOutline,
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

  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit() {

    this.cargarLista();

  }

  // ==========================================
  // CARGAR LISTA DESDE SUPABASE
  // ==========================================

  async cargarLista() {

    this.cargando = true;
    this.error = '';

    try {

      const res =
        await this.comprasService.getListaCompras();

      this.categorias =
        res.categorias;

      this.ahorroProyectado =
        res.estadisticas.ahorro_proyectado;

      console.log(
        'Lista de compras desde Supabase:',
        res
      );

    } catch (error) {

      console.error(
        'Error cargando lista de compras:',
        error
      );

      this.error =
        'No se pudo cargar la lista de compras.';

      this.categorias = [];

    } finally {

      this.cargando = false;

    }
  }

  // ==========================================
  // MARCAR / DESMARCAR
  // ==========================================

  async toggleItem(item: ItemCompra) {

    const estadoAnterior =
      item.marcado;

    // Cambio visual inmediato

    item.marcado =
      !item.marcado;

    try {

      await this.comprasService.toggleItem(
        item.id
      );

      console.log(
        'Producto actualizado correctamente:',
        item.nombre
      );

    } catch (error) {

      console.error(
        'Error actualizando producto:',
        error
      );

      // Regresar al estado anterior

      item.marcado =
        estadoAnterior;

      alert(
        'No se pudo actualizar el producto.'
      );
    }
  }

  // ==========================================
  // GENERAR LISTA AUTOMÁTICA
  // ==========================================

  generarListaAutomatica() {

    this.router.navigate([
      '/escaneo-inteligente'
    ]);

  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  irADashboard() {

    this.router.navigate([
      '/inventario'
    ]);

  }

  // ==========================================
  // BÚSQUEDA
  // ==========================================

  buscar() {

    console.log(
      'Buscar en lista de compras'
    );

  }

  // ==========================================
  // CONFIGURACIÓN
  // ==========================================

  irAConfiguracion() {

    this.router.navigate([
      '/configuracion'
    ]);

  }

  // ==========================================
  // AGREGAR PRODUCTO
  // ==========================================

  agregarItem() {

    this.router.navigate([
      '/agregar-producto'
    ]);

  }

  // ==========================================
  // NAVEGACIÓN INFERIOR
  // ==========================================

  navegar(item: any) {

    this.bottomNavItems =
      this.bottomNavItems.map(
        nav => ({
          ...nav,
          active:
            nav.id === item.id
        })
      );

    if (item.path) {

      this.router.navigate([
        item.path
      ]);

    }

  }

}