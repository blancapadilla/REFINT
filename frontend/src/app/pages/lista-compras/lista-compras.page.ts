import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
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
} from 'ionicons/icons';

// Importamos el servicio e interfaces
import { ComprasService, ItemCompra } from 'src/app/services/compras.service';

@Component({
  selector: 'app-lista-compras',
  templateUrl: './lista-compras.page.html',
  styleUrls: ['./lista-compras.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ListaComprasPage implements OnInit {

  // Iconos
  settingsOutline = settingsOutline;
  sparklesOutline = sparklesOutline;
  trendingDownOutline = trendingDownOutline;
  leafOutline = leafOutline;
  addOutline = addOutline;

  // Variables dinámicas cargadas desde FastAPI
  categorias: any[] = [];
  ahorroProyectado: string = '20%';

  // Mapeo de strings de íconos recibidos del Backend a objetos IonIcons
  private iconMap: { [key: string]: any } = {
    waterOutline: waterOutline,
    leafOutline: leafOutline,
    nutritionOutline: nutritionOutline
  };

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: true },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private comprasService: ComprasService // Inyección de servicio
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

  ngOnInit() {
    this.cargarLista();
  }

  // Cargar datos desde FastAPI
  cargarLista() {
    this.comprasService.getListaCompras().subscribe({
      next: (res) => {
        this.ahorroProyectado = res.estadisticas.ahorro_proyectado;
        this.categorias = res.categorias.map(cat => ({
          ...cat,
          icono: this.iconMap[cat.icono] || leafOutline
        }));
      },
      error: (err) => console.error('Error al obtener lista de compras:', err)
    });
  }

  // Marcar / desmarcar producto (Persiste en Backend)
  toggleItem(item: ItemCompra) {
    item.marcado = !item.marcado; // Feedback visual inmediato

    this.comprasService.toggleItem(item.id).subscribe({
      error: (err) => {
        console.error('Error al actualizar ítem:', err);
        item.marcado = !item.marcado; // Revertir en caso de error
      }
    });
  }

  // Generación predictiva con FreshIQ
  generarListaAutomatica() {
    this.comprasService.generarListaAutomatica().subscribe({
      next: (res) => {
        this.categorias = res.categorias.map(cat => ({
          ...cat,
          icono: this.iconMap[cat.icono] || leafOutline
        }));
      },
      error: (err) => console.error('Error al generar lista con FreshIQ:', err)
    });
  }

  irADashboard() {
    this.router.navigate(['/dashboard']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  agregarItem() {
    console.log('Abrir formulario para agregar item a la lista');
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}