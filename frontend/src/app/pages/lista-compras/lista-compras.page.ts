import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
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

interface ItemBadge {
  texto: string;
  tipo: 'critico' | 'agotado';
}

interface ItemCompra {
  nombre: string;
  marcado: boolean;
  badge?: ItemBadge;
}

interface CategoriaCompra {
  id: string;
  nombre: string;
  icono: string;
  color: 'blue' | 'green' | 'teal';
  items: ItemCompra[];
}

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.page.html',
  styleUrls: ['./lista-compras.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent]
})
export class ListaComprasPage implements OnInit {

  // Iconos
  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  sparklesOutline = sparklesOutline;
  trendingDownOutline = trendingDownOutline;
  leafOutline = leafOutline;
  addOutline = addOutline;

  // Categorías con sus items (datos visuales de ejemplo)
  categorias: CategoriaCompra[] = [
    {
      id: 'lacteos',
      nombre: 'Lácteos',
      icono: waterOutline,
      color: 'blue',
      items: [
        { nombre: 'Leche Entera (1L)', marcado: false, badge: { texto: 'Crítico', tipo: 'critico' } },
        { nombre: 'Yogurt Griego', marcado: false },
        { nombre: 'Queso Parmesano', marcado: false }
      ]
    },
    {
      id: 'verduras',
      nombre: 'Verduras',
      icono: leafOutline,
      color: 'green',
      items: [
        { nombre: 'Espinacas Baby', marcado: false, badge: { texto: 'Agotado', tipo: 'agotado' } },
        { nombre: 'Pimientos Rojos', marcado: false }
      ]
    },
    {
      id: 'frutas',
      nombre: 'Frutas',
      icono: nutritionOutline,
      color: 'teal',
      items: [
        { nombre: 'Arándanos', marcado: false }
      ]
    }
  ];

  // Menú inferior: "Shopping" está ACTIVO (active: true)
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: true },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(private router: Router) {
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

  ngOnInit() {}

  irADashboard() {
    this.router.navigate(['/inventario']);
  }

  buscar() {
    console.log('Buscar en lista de compras');
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  generarListaAutomatica() {
    console.log('Generar lista automáticamente con FreshIQ');
  }

  toggleItem(item: ItemCompra) {
    item.marcado = !item.marcado;
  }

  agregarItem() {
    console.log('Abrir formulario para agregar item a la lista');
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