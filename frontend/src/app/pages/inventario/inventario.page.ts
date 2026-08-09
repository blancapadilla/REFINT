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

// Importamos el servicio y las interfaces creadas
import { InventarioService, ProductoInventario, Categoria } from 'src/app/services/inventario.service';

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

  // Arreglos vacíos que se llenarán dinámicamente desde FastAPI
  categorias: Categoria[] = [];
  productos: ProductoInventario[] = [];
  productosFiltrados: ProductoInventario[] = [];

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: true },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private inventarioService: InventarioService // Inyección del servicio de Backend
  ) {
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
    this.cargarDatos();
  }

  // Carga inicial de datos desde FastAPI
  cargarDatos() {
    // 1. Obtener categorías desde el backend
    this.inventarioService.getCategorias().subscribe({
      next: (cats) => (this.categorias = cats),
      error: (err) => console.error('Error al cargar categorías:', err)
    });

    // 2. Obtener productos desde el backend
    this.inventarioService.getProductos().subscribe({
      next: (prods) => {
        this.productos = prods;
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
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

  // Eliminación conectada al endpoint DELETE /api/v1/inventario/{id}
  eliminarProducto(item: ProductoInventario) {
    this.inventarioService.eliminarProducto(item.id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== item.id);
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al eliminar el producto:', err)
    });
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}