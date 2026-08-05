import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  snowOutline, 
  settingsOutline, 
  searchOutline, 
  filterOutline, 
  calendarOutline, 
  createOutline, 
  trashOutline, 
  addOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline,
  notificationsOutline
} from 'ionicons/icons';

interface ProductoInventario {
  id: string;
  nombre: string;
  cantidad: string;
  categoria: string;
  estado: 'critical' | 'soon' | 'fresh';
  etiquetaEstado: string;
  vencimiento: string;
  imagen: string;
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class InventarioPage implements OnInit {
  textoBusqueda: string = '';
  categoriaSeleccionada: string = 'todos';

  // Iconos
  snowOutline = snowOutline;
  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  filterOutline = filterOutline;
  calendarOutline = calendarOutline;
  createOutline = createOutline;
  trashOutline = trashOutline;
  addOutline = addOutline;

  // Categorías de filtro rápido
  categorias = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'lacteos', nombre: 'Lácteos' },
    { id: 'vegetales', nombre: 'Vegetales' },
    { id: 'carnes', nombre: 'Carnes' },
    { id: 'bebidas', nombre: 'Bebidas' }
  ];

  // Listado de productos del inventario
  productos: ProductoInventario[] = [
    {
      id: '1',
      nombre: 'Leche Entera',
      cantidad: '2 Litros',
      categoria: 'lacteos',
      estado: 'critical',
      etiquetaEstado: 'Crítico',
      vencimiento: 'Vence: Mañana',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtDBOUVvdgvEgTVlA2cENbF8knIfdl4ViLT8qM78sRD_3-lcS7GKie6R_mtKLHZLjhWajAUrO9upVONIor2zprZGuHpyVv8ek0PKfJOio1DO4fy8fa168bQo0NyZ2AeBTCzoj7iUQb5AahCW5vHhn5NjXXFjvcg-fsQxTBWSZOb4kcpT0MuwuFNh3H1H6o8DBqg2UDjJOqT_bh1el9G1FbMynkM_ySvHqWAjRzPPfUfMStrHLz1wwf-AjTPVLlMzVPWu7vlTFIV6U'
    },
    {
      id: '2',
      nombre: 'Huevos Orgánicos',
      cantidad: '12 unidades',
      categoria: 'lacteos',
      estado: 'fresh',
      etiquetaEstado: 'Fresco',
      vencimiento: 'Vence: Oct 24, 2026',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBea0BBQev_7EOUuIE3ShGm5jBlngeN1sYln_gqm2y1ZpoMlq5z4YnxUqPLrhvHN7NLeBULITIz-IHtKJLiVMd0G-JPZ4tKAXb89uDkCyrSruqXxZ8S735qKBCOC_wUwr8TI36VOeVhubqGARfaWXatSz1bNqELfoAWKHmnIoI6_THP2tQjaDsbdFVloO7FZCFH4FxcBDNzVsGYSu_mTrJTZApA3Uwqqu624WposLe2MVLFf5bNgJVdTu4OYde7z9yqtqjuALacdfo'
    },
    {
      id: '3',
      nombre: 'Yogurt Griego',
      cantidad: '500g',
      categoria: 'lacteos',
      estado: 'soon',
      etiquetaEstado: 'Pronto',
      vencimiento: 'Vence: 3 días restantes',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAI_-R3dol8hY_EMfyX0TPH_3YfJ18s4MJh13XdNr-OEuCVR8bfn13oezgi7ffJpyRAwo3IP9ocVhzAlahKzcDr-HbK_4wXWMKJwgNN8pcr4yV0pLLYqlhL76Od5LAywL0lRAsSMxpfJf6JprmZFd3-tE6kAm0mG9-86lbqbkppk5Ndc_bjkqkCLmqKmTKByKNUpi4aD-K5bdmUT-Xy7UD7iF5MqUSsrgi8OENPlmQwqvhKRBBEQvowDkxjlq2w-Fqa5285ysXcZTI'
    },
    {
      id: '4',
      nombre: 'Aguacate Hass',
      cantidad: '3 unidades',
      categoria: 'vegetales',
      estado: 'fresh',
      etiquetaEstado: 'Fresco',
      vencimiento: 'Vence: Oct 28, 2026',
      imagen: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-xRxLcMtj-_UXUGxgt7axg2OSoqx1JoKzIAlDiaMoe3ITKnpxIvLx2RgYbvQyLlmt9DWp8FFWlXMFIGtIaAwHxn0nfDU-lTfXDUhnF7BnscfwSd7LR5et-bzRc4NvRKLFBpze4jcljtbv8t1uLe246h1b7l2z3_l4fhOwluA9xS9pzV8uyoRWLse14zCM46fGvZBllnFNE09J11-P1GDzcLu3q35sI54qpOpwyJJL_h7VXX6zOD2BzIlJFHwoxgof4YJ1Zu0JSmE'
    }
  ];

  productosFiltrados: ProductoInventario[] = [];

  // Menú inferior: "Inventory" está ACTIVO (active: true)
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: true },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(private router: Router) {
    addIcons({
      snowOutline,
      settingsOutline,
      searchOutline,
      filterOutline,
      calendarOutline,
      createOutline,
      trashOutline,
      addOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline,
      notificationsOutline
    });
  }

  ngOnInit() {
    this.productosFiltrados = [...this.productos];
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  seleccionarCategoria(catId: string) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(item => {
      const coincideBusqueda = item.nombre.toLowerCase().includes(this.textoBusqueda.toLowerCase());
      const coincideCategoria = this.categoriaSeleccionada === 'todos' || item.categoria === this.categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }

  agregarProducto() {
    console.log('Abrir formulario para agregar alimento');
  }

  editarProducto(item: ProductoInventario) {
    console.log('Editar producto:', item.nombre);
  }

  eliminarProducto(item: ProductoInventario) {
    this.productos = this.productos.filter(p => p.id !== item.id);
    this.aplicarFiltros();
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}