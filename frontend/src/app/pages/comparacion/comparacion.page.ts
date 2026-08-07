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

interface ItemCritico {
  nombre: string;
  subtexto: string;
  estado: 'disponible' | 'faltante' | 'agotado';
  colorPlaceholder: '1' | '2' | '3';
}

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

  // Resumen superior
  resumen = {
    disponible: 24,
    faltante: 8,
    agotado: 3
  };

  // Filtros de categoría dentro de "Estado de Inventario Crítico"
  filtrosCriticos = [
    { id: 'lacteos', nombre: 'Lácteos' },
    { id: 'frutas', nombre: 'Frutas' }
  ];
  filtroSeleccionado: string = 'lacteos';

  // Listado visual de ejemplo
  itemsCriticos: ItemCritico[] = [
    { nombre: 'Leche Entera 1L', subtexto: 'Última compra: hace 7 días', estado: 'agotado', colorPlaceholder: '1' },
    { nombre: 'Huevos Orgánicos (12)', subtexto: 'Quedan: 2 unidades', estado: 'faltante', colorPlaceholder: '2' },
    { nombre: 'Manzanas Verdes', subtexto: 'Quedan: 6 unidades', estado: 'disponible', colorPlaceholder: '3' }
  ];

  // Sincronización de lista
  articulosReposicion: string[] = ['Pan Integral', 'Yogurt Griego'];

  // Uso de inventario (donut)
  uso = {
    frutas: 12,
    lacteos: 40,
    carnes: 16,
    otros: 32,
    lleno: 68
  };

  donutDashArray: string = '';
  donutDashOffset: string = '';

  // Menú inferior: "Sync" está ACTIVO (active: true)
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false, badge: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false, badge: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: true, badge: true },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false, badge: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false, badge: false }
  ];

  constructor(private router: Router) {
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
    const radio = 58;
    const circunferencia = 2 * Math.PI * radio;
    const progreso = (this.uso.lleno / 100) * circunferencia;
    this.donutDashArray = `${circunferencia}`;
    this.donutDashOffset = `${circunferencia - progreso}`;
  }

  iconoEstado(estado: string) {
    if (estado === 'agotado') return this.closeCircleOutline;
    if (estado === 'faltante') return this.warningOutline;
    return this.checkmarkCircleOutline;
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  buscar() {
    console.log('Abrir búsqueda de comparación');
  }

  seleccionarFiltro(id: string) {
    this.filtroSeleccionado = id;
  }

  actualizarShoppingList() {
    console.log('Actualizar Shopping List con artículos sugeridos');
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}