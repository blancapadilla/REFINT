import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { InventarioService } from '../../services/inventario.service';
import { AuthService } from '../../services/auth';
import { RefrigeradorService } from '../../services/refrigerador.service';
import { addIcons } from 'ionicons';
import {
  snowOutline, settingsOutline, searchOutline, filterOutline, calendarOutline,
  createOutline, trashOutline, addOutline, cubeOutline, cartOutline, syncOutline,
  timeOutline, notificationsOutline, analyticsOutline, alertCircleOutline,
  barChartOutline, wifiOutline, cameraOutline
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
  fuente?: 'ai' | 'manual';
}

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class InventarioPage {
  textoBusqueda = '';
  categoriaSeleccionada = 'todos';
  totalProductos = 0;

    searchOutline = searchOutline;
    filterOutline = filterOutline;
    cameraOutline = cameraOutline;
    createOutline = createOutline;
    calendarOutline = calendarOutline;
    trashOutline = trashOutline;
    addOutline = addOutline;
  
  // Añadimos la categoría "Otros" para los productos sin categoría
  categorias = [
    { id: 'todos', nombre: 'Todos' },
    { id: 'lacteos', nombre: 'Lácteos' },
    { id: 'vegetales', nombre: 'Vegetales' },
    { id: 'carnes', nombre: 'Carnes' },
    { id: 'bebidas', nombre: 'Bebidas' },
    { id: 'otros', nombre: 'Otros' } 
  ];

  productos: ProductoInventario[] = [];
  productosFiltrados: ProductoInventario[] = [];

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: true },
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private inventoryService: InventarioService,
    private authService: AuthService,
    private refrigeradorService: RefrigeradorService
  ) {
    addIcons({ snowOutline, settingsOutline, searchOutline, filterOutline, calendarOutline, createOutline, trashOutline, addOutline, cubeOutline, cartOutline, syncOutline, timeOutline, notificationsOutline, analyticsOutline, alertCircleOutline, barChartOutline, wifiOutline, cameraOutline });
  }

  // 1. REEMPLAZO DE ngOnInit por ionViewWillEnter (Se ejecuta siempre que entras a la pantalla)
  async ionViewWillEnter() {
    const session = await this.authService.getSession();
    if (!session) {
      await this.router.navigate(['/login']);
      return;
    }
    const tieneRefri = await this.refrigeradorService.tieneRefrigerador();
    if (!tieneRefri) {
      await this.router.navigate(['/registro-refri']);
      return;
    }
    await this.cargarInventario();
  }

async cargarInventario() {
    try {
      const data = await this.inventoryService.getInventory();
      
      this.productos = (data ?? []).map((item: any): ProductoInventario => {
        const estadoVisual = this.obtenerEstadoVisual(item);
        return {
          id: item.id,
          nombre: item.product_name ?? 'Producto',
          cantidad: `${item.quantity ?? 0} ${item.unit ?? ''}`.trim(),
          categoria: this.normalizarCategoria(item),
          estado: estadoVisual,
          etiquetaEstado: this.obtenerEtiquetaEstado(estadoVisual),
          vencimiento: this.formatearVencimiento(item.days_to_expiry, item.expires_on),
          // 👇 Usamos la función inteligente del servicio
          imagen: this.inventoryService.obtenerImagenProducto(item),
          fuente: item.source === 'ai' ? 'ai' : 'manual'
        };
      });

      this.totalProductos = this.productos.length;
      this.aplicarFiltros();
    } catch (error) {
      console.error('Error cargando inventario:', error);
    }
  }

  // Manejador de error cuando una URL externa no logra cargar
  // 3. NUEVA LÓGICA DE ETIQUETAS: Busca en la categoría y en el nombre del producto
  normalizarCategoria(item: any): string {
    const catName = (item.category_name || item.categoria || '').toLowerCase();
    const prodName = (item.product_name || item.nombre || '').toLowerCase();

    if (catName.includes('lácteo') || catName.includes('lacteo') || catName.includes('huevo') || prodName.includes('leche') || prodName.includes('queso') || prodName.includes('yogurt') || prodName.includes('huevo')) return 'lacteos';
    if (catName.includes('fruta') || catName.includes('vegetal') || catName.includes('verdura') || prodName.includes('tomate') || prodName.includes('espinaca') || prodName.includes('apio') || prodName.includes('platano')) return 'vegetales';
    if (catName.includes('carne') || catName.includes('proteína') || catName.includes('proteina') || prodName.includes('pollo') || prodName.includes('pescado')) return 'carnes';
    if (catName.includes('bebida') || prodName.includes('agua') || prodName.includes('refresco') || prodName.includes('jugo')) return 'bebidas';
    if (catName.includes('congelado') || prodName.includes('helado') || prodName.includes('hielo')) return 'congelados';

    return 'otros';
  }

  obtenerEstadoVisual(item: any): 'critical' | 'soon' | 'fresh' {
    if (item.status === 'caducado' || item.status === 'agotado') return 'critical';
    const dias = item.days_to_expiry;
    if (dias == null) return 'fresh';
    if (Number(dias) <= 1) return 'critical';
    if (Number(dias) <= 3) return 'soon';
    return 'fresh';
  }

  obtenerEtiquetaEstado(estado: 'critical' | 'soon' | 'fresh'): string {
    switch (estado) {
      case 'critical': return 'CRITICAL';
      case 'soon': return 'SOON';
      default: return 'FRESH';
    }
  }

  formatearVencimiento(dias: number | null | undefined, fecha: string | null | undefined): string {
    if (!fecha) return 'Sin fecha de vencimiento';
    if (dias == null) return `Vence: ${fecha}`;
    const diasNumero = Number(dias);
    if (diasNumero < 0) return 'Caducado';
    if (diasNumero === 0) return 'Vence: Hoy';
    if (diasNumero <= 7) return `Exp: en ${diasNumero} día(s)`;
    return `Exp: ${new Date(`${fecha}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  obtenerImagenProducto(item: any): string {
    if (item.product_image_path && /^https?:\/\//i.test(item.product_image_path)) return item.product_image_path;
    if (item.image_path && /^https?:\/\//i.test(item.image_path)) return item.image_path;
    const nombre = (item.product_name ?? '').toLowerCase();
    if (nombre.includes('leche')) return 'assets/images/products/lecheentera.webp';
    if (nombre.includes('espinaca')) return 'assets/images/products/espinacas.png';
    return 'assets/images/products/default-product.png';
  }

  onImageError(event: any) {
    event.target.onerror = null;
    event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect x="3" y="3" width="18" height="18" rx="4" fill="%23f1f5f9" stroke="none"/%3E%3Cpath d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/%3E%3Cpolyline points="3.27 6.96 12 12.01 20.73 6.96"/%3E%3Cline x1="12" y1="22.08" x2="12" y2="12"/%3E%3C/svg%3E';
  }

  seleccionarCategoria(catId: string) {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const busqueda = (this.textoBusqueda || '').trim().toLowerCase();
    this.productosFiltrados = this.productos.filter(item => {
      const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda);
      const coincideCategoria = this.categoriaSeleccionada === 'todos' || item.categoria === this.categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }

async eliminarProducto(item: ProductoInventario) {
    // 👇 Soluciona el warning de "aria-hidden" quitando el foco del botón presionado
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      // Llamamos al servicio para borrar
      const exito = await this.inventoryService.eliminarProducto(item.id);
      
      if (exito) {
        // Actualizamos las listas en pantalla de inmediato
        this.productos = this.productos.filter(producto => producto.id !== item.id);
        this.totalProductos = this.productos.length;
        this.aplicarFiltros();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }

  agregarProducto() { this.router.navigate(['/agregar-producto']); }
  editarProducto(item: ProductoInventario) { console.log('Editar:', item.nombre); }
  irADashboard() { this.router.navigate(['/dashboard']); }
  irAConfiguracion() { this.router.navigate(['/configuracion']); }
  buscar() {}
  irA(ruta: string) { this.router.navigate([ruta]); }
  navegar(item: any) { if (item.path) this.router.navigate([item.path]); }
}