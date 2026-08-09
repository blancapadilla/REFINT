import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { addIcons } from 'ionicons';
import { 
  snowOutline, 
  settingsOutline, 
  personOutline, 
  lockClosedOutline, 
  cameraOutline, 
  notificationsOutline, 
  globeOutline, 
  sunnyOutline, 
  moonOutline, 
  logOutOutline, 
  chevronForwardOutline, 
  createOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline
} from 'ionicons/icons';

// Importamos el servicio
import { ConfiguracionService } from 'src/app/services/configuracion.service';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class ConfiguracionPage implements OnInit {

  // Datos de usuario
  nombreUsuario = '';
  emailUsuario = '';
  planUsuario = '';
  
  // Preferencias
  esModoOscuro = false;
  notificacionesActivadas = true;
  idiomaSeleccionado = 'Español';
  camaraConectada = false;

  // Iconos importados para la plantilla
  snowOutline = snowOutline;
  settingsOutline = settingsOutline;
  personOutline = personOutline;
  lockClosedOutline = lockClosedOutline;
  cameraOutline = cameraOutline;
  notificationsOutline = notificationsOutline;
  globeOutline = globeOutline;
  sunnyOutline = sunnyOutline;
  moonOutline = moonOutline;
  logOutOutline = logOutOutline;
  chevronForwardOutline = chevronForwardOutline;
  createOutline = createOutline;

  // Menú inferior
  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Lista de Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: false },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];

  constructor(
    private router: Router,
    private configuracionService: ConfiguracionService // Inyección de servicio
  ) {
    addIcons({
      snowOutline,
      settingsOutline,
      personOutline,
      lockClosedOutline,
      cameraOutline,
      notificationsOutline,
      globeOutline,
      sunnyOutline,
      moonOutline,
      logOutOutline,
      chevronForwardOutline,
      createOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline
    });
  }

  ngOnInit() {
    this.cargarConfiguracion();
  }

  cargarConfiguracion() {
    this.configuracionService.getConfiguracion().subscribe({
      next: (res) => {
        this.nombreUsuario = res.perfil.nombre;
        this.emailUsuario = res.perfil.email;
        this.planUsuario = res.perfil.plan;
        
        this.camaraConectada = res.dispositivos.camaraConectada;

        this.notificacionesActivadas = res.preferencias.notificacionesActivadas;
        this.idiomaSeleccionado = res.preferencias.idioma;
        this.esModoOscuro = res.preferencias.esModoOscuro;

        // Aplicar modo oscuro si viene activado
        document.body.classList.toggle('dark', this.esModoOscuro);
      },
      error: (err) => console.error('Error al obtener la configuración:', err)
    });
  }

  irADashboard() {
    this.router.navigate(['/inventario']);
  }

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }

  cambiarTema(event: any) {
    this.esModoOscuro = event.detail.checked;
    document.body.classList.toggle('dark', this.esModoOscuro);

    this.configuracionService.actualizarPreferencias({ esModoOscuro: this.esModoOscuro }).subscribe({
      error: (err) => console.error('Error al guardar el tema:', err)
    });
  }

  cerrarSesion() {
    this.configuracionService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  navegar(item: any) {
    if (item.path) {
      this.router.navigate([item.path]);
    }
  }
}