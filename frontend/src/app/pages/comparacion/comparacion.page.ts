import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  searchOutline,
  settingsOutline,
  checkmarkCircleOutline,
  warningOutline,
  closeCircleOutline,
  eyeOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline,
  notificationsOutline
} from 'ionicons/icons';

// Importamos el servicio e interfaces
import { SyncService, ItemCritico, FiltroCritico } from 'src/app/services/sync.service';

@Component({
  selector: 'app-comparacion',
  templateUrl: './comparacion.page.html',
  styleUrls: ['./comparacion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ComparacionPage implements OnInit {

  // Iconos
  searchOutline = searchOutline;
  settingsOutline = settingsOutline;
  checkmarkCircleOutline = checkmarkCircleOutline;
  warningOutline = warningOutline;
  closeCircleOutline = closeCircleOutline;
  eyeOutline = eyeOutline;

  // Variables alimentadas dinámicamente desde FastAPI
  resumen = { disponible: 0, faltante: 0, agotado: 0 };
  filtrosCriticos: FiltroCritico[] = [];
  filtroSeleccionado: string = 'lacteos';
  todosItemsCriticos: ItemCritico[] = [];
  itemsCriticos: ItemCritico[] = [];
  articulosReposicion: string[] = [];
  uso = { frutas: 0, lacteos: 0, carnes: 0, otros: 0, lleno: 0 };

  // Trazo SVG para la gráfica de dona
  donutDashArray: string = '';
  donutDashOffset: string = '';

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false, badge: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false, badge: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: true, badge: true },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false, badge: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false, badge: false }
  ];

  constructor(
    private router: Router,
    private syncService: SyncService // Inyección del servicio
  ) {
    addIcons({
      searchOutline,
      settingsOutline,
      checkmarkCircleOutline,
      warningOutline,
      closeCircleOutline,
      eyeOutline,
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

  // Cargar datos desde FastAPI
  cargarDatos() {
    this.syncService.getComparacionData().subscribe({
      next: (data) => {
        this.resumen = data.resumen;
        this.filtrosCriticos = data.filtrosCriticos;
        this.todosItemsCriticos = data.itemsCriticos;
        this.articulosReposicion = data.articulosReposicion;
        this.uso = data.uso;

        if (this.filtrosCriticos.length > 0) {
          this.filtroSeleccionado = this.filtrosCriticos[0].id;
        }

        this.filtrarItems();
        this.calcularGraficaDona();
      },
      error: (err) => console.error('Error al cargar datos de sincronización:', err)
    });
  }

  // Calcula el porcentaje visual del círculo SVG según uso.lleno
  calcularGraficaDona() {
    const radio = 58;
    const circunferencia = 2 * Math.PI * radio;
    const progreso = (this.uso.lleno / 100) * circunferencia;
    this.donutDashArray = `${circunferencia}`;
    this.donutDashOffset = `${circunferencia - progreso}`;
  }

  // Cambiar categoría de productos críticos
  seleccionarFiltro(id: string) {
    this.filtroSeleccionado = id;
    this.filtrarItems();
  }

  filtrarItems() {
    this.itemsCriticos = this.todosItemsCriticos.filter(
      item => item.categoria_id === this.filtroSeleccionado
    );
  }

  // Sincronización real enviando POST al Backend y redirigiendo a la lista de compras
  actualizarShoppingList() {
    this.syncService.actualizarShoppingList().subscribe({
      next: (res) => {
        console.log('Sincronización exitosa:', res.mensaje);
        this.router.navigate(['/lista-compras']);
      },
      error: (err) => console.error('Error al actualizar shopping list:', err)
    });
  }

  iconoEstado(estado: string) {
    if (estado === 'agotado') return this.closeCircleOutline;
    if (estado === 'faltante') return this.warningOutline;
    return this.checkmarkCircleOutline;
  }

  irADashboard() { this.router.navigate(['/dashboard']); }
  irAConfiguracion() { this.router.navigate(['/configuracion']); }
  buscar() { console.log('Abrir búsqueda de comparación'); }
  navegar(item: any) { if (item.path) this.router.navigate([item.path]); }
}