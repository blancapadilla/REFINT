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
      import('./pages/dashboard/dashboard.page').then(
        (m) => m.DashboardPage
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'inventario',
    loadComponent: () => import('./pages/inventario/inventario.page').then( m => m.InventarioPage)

  },
  {
    path: 'configuracion',
    loadComponent: () => import('./pages/configuracion/configuracion.page').then( m => m.ConfiguracionPage)
  },
  {
    path: 'lista-compras',
    loadComponent: () => import('./pages/lista-compras/lista-compras.page').then( m => m.ListaComprasPage)
  },
  {
    path: 'comparacion',
    loadComponent: () => import('./pages/comparacion/comparacion.page').then( m => m.ComparacionPage)
  },
  {
    path: 'alertas',
    loadComponent: () => import('./pages/alertas/alertas.page').then( m => m.AlertasPage)
  },
  {
    path: 'historial',
    loadComponent: () => import('./pages/historial/historial.page').then((m) => m.HistorialPage),
  },


];