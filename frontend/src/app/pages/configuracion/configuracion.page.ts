import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { AuthService } from '../../services/auth';
import { RefrigeradorService, Refrigerador } from '../../services/refrigerador.service';
import { SupabaseService } from '../../services/supabase';
import { addIcons } from 'ionicons';
import {
  personOutline, lockClosedOutline, cameraOutline,
  notificationsOutline, globeOutline, sunnyOutline,
  moonOutline, logOutOutline, chevronForwardOutline,
  createOutline, cubeOutline, cartOutline, syncOutline,
  timeOutline, snowOutline, addCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.page.html',
  styleUrls: ['./configuracion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class ConfiguracionPage implements OnInit {
  nombreUsuario = '';
  emailUsuario  = '';
  planUsuario   = 'Free';
  esModoOscuro  = false;
  idiomaSeleccionado = 'Español';
  camaraConectada    = false;
  refrigerador: Refrigerador | null = null;

  personOutline       = personOutline;
  lockClosedOutline   = lockClosedOutline;
  cameraOutline       = cameraOutline;
  notificationsOutline= notificationsOutline;
  globeOutline        = globeOutline;
  sunnyOutline        = sunnyOutline;
  moonOutline         = moonOutline;
  logOutOutline       = logOutOutline;
  chevronForwardOutline = chevronForwardOutline;
  createOutline       = createOutline;
  snowOutline         = snowOutline;
  addCircleOutline    = addCircleOutline;

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario',      icon: cubeOutline,          path: '/inventario',    active: false },
    { id: 'shopping',  label: 'Lista de Compras', icon: cartOutline,          path: '/lista-compras', active: false },
    { id: 'sync',      label: 'Sincronizar',      icon: syncOutline,          path: '/comparacion',   active: false },
    { id: 'history',   label: 'Historial',        icon: timeOutline,          path: '/historial',     active: false },
    { id: 'alerts',    label: 'Alertas',          icon: notificationsOutline, path: '/alertas',       active: false }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private refrigeradorService: RefrigeradorService,
    private supabase: SupabaseService
  ) {
    addIcons({
      personOutline, lockClosedOutline, cameraOutline, notificationsOutline,
      globeOutline, sunnyOutline, moonOutline, logOutOutline,
      chevronForwardOutline, createOutline, cubeOutline, cartOutline,
      syncOutline, timeOutline, snowOutline, addCircleOutline
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.cargarPerfil(),
      this.cargarRefrigerador()
    ]);
  }

  async cargarPerfil() {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (!user) return;

    this.emailUsuario = user.email ?? '';

    const { data: perfil } = await this.supabase.client
      .from('profiles')
      .select('full_name, plan_name')
      .eq('id', user.id)
      .single();

    if (perfil) {
      this.nombreUsuario = perfil.full_name ?? this.emailUsuario.split('@')[0];
      this.planUsuario   = perfil.plan_name ?? 'Free';
    }
  }

  async cargarRefrigerador() {
    this.refrigerador = await this.refrigeradorService.getMiRefrigerador();
    if (this.refrigerador) {
      const { data } = await this.supabase.client
        .from('devices')
        .select('status')
        .eq('refrigerator_id', this.refrigerador.id)
        .eq('type', 'camera')
        .limit(1)
        .single();
      this.camaraConectada = data?.status === 'online';
    }
  }

  cambiarTema(event: any) {
    this.esModoOscuro = event.detail.checked;
    document.body.classList.toggle('dark', this.esModoOscuro);
  }

  async cerrarSesion() {
    await this.authService.signOut();
    await this.router.navigate(['/login']);
  }

  irARegistroRefri() {
    this.router.navigate(['/registro-refri']);
  }

  navegar(item: any) {
    if (item.path) this.router.navigate([item.path]);
  }
}
