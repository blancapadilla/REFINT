import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { settingsOutline, searchOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  @Input() title = '';
  @Input() icon = 'notifications';
  @Input() showSettings = false;
  @Input() showSearch = false;
  @Input() showBack = false;
  @Input() backRoute = ''; // Opcional: ruta de respaldo fija (ej. '/dashboard')

  @Output() search = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  arrowBackOutline = arrowBackOutline;

  constructor(
    private router: Router,
    private navCtrl: NavController // Inyectamos el controlador de navegación de Ionic
  ) {
    addIcons({
      'settings-outline': settingsOutline,
      'search-outline': searchOutline,
      'arrow-back-outline': arrowBackOutline,
      settingsOutline,
      searchOutline,
      arrowBackOutline
    });
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  navigateSettings() {
    this.router.navigate(['/configuracion']);
  }

  triggerSearch() {
    this.search.emit();
  }

  goBack() {
    this.back.emit();

    // 1. Si especificamos una ruta manual en 'backRoute', va directamente ahí
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
      return;
    }

    // 2. Si no, te regresa automáticamente a la pantalla anterior con animación
    this.navCtrl.back();
  }
}