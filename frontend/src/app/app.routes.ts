import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./pages/inventario/inventario.page').then((m) => m.InventarioPage),
  },
  {
    path: 'shopping',
    redirectTo: 'lista-compras',
    pathMatch: 'full',
  },
  {
    path: 'sync',
    redirectTo: 'comparacion',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then((m) => m.ConfiguracionPage),
  },
  {
    path: 'lista-compras',
    loadComponent: () =>
      import('./pages/lista-compras/lista-compras.page').then((m) => m.ListaComprasPage),
  },
  {
    path: 'comparacion',
    loadComponent: () =>
      import('./pages/comparacion/comparacion.page').then((m) => m.ComparacionPage),
  },
  {
    path: 'alertas',
    loadComponent: () =>
      import('./pages/alertas/alertas.page').then((m) => m.AlertasPage),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/historial/historial.page').then((m) => m.HistorialPage),
  },
  {
    path: 'deteccion-manual',
    loadComponent: () =>
      import('./pages/deteccion-manual/deteccion-manual.page').then((m) => m.DeteccionManualPage),
  },
  {
    path: 'estado-sistema',
    loadComponent: () =>
      import('./pages/estado-sistema/estado-sistema.page').then((m) => m.EstadoSistemaPage),
  },
  {
    path: 'escaneo-inteligente',
    loadComponent: () =>
      import('./pages/escaneo-inteligente/escaneo-inteligente.page').then((m) => m.EscaneoInteligentePage),
  },
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./pages/estadisticas/estadisticas.page').then((m) => m.EstadisticasPage),
  },
  {
    path: 'agregar-producto',
    loadComponent: () =>
      import('./pages/agregar-producto/agregar-producto.page').then((m) => m.AgregarProductoPage),
  },
  {
    path: 'registro-refri',
    loadComponent: () =>
      import('./pages/registro-refri/registro-refri.page').then((m) => m.RegistroRefriPage),
  },
];