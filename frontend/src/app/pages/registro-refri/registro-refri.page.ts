import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { addIcons } from 'ionicons';
import { cubeOutline, qrCodeOutline, checkmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro-refri',
  templateUrl: './registro-refri.page.html',
  styleUrls: ['./registro-refri.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class RegistroRefriPage {
  nombre = '';
  codigo = '';
  guardando = false;
  errorMsg = '';

  cubeOutline = cubeOutline;
  qrCodeOutline = qrCodeOutline;
  checkmarkOutline = checkmarkOutline;

  constructor(private navCtrl: NavController) {
    addIcons({
      cubeOutline,
      qrCodeOutline,
      checkmarkOutline
    });
  }

  valido(): boolean {
    return this.nombre.trim().length >= 3 && this.codigo.trim().length >= 4;
  }

  async registrar() {
    if (!this.valido() || this.guardando) return;

    this.guardando = true;
    this.errorMsg = '';

    try {
      // AQUÍ IRÁ LA VINCULACIÓN CON SUPABASE
      // Ejemplo: await this.supabase.from('refrigerators').insert({ name: this.nombre, device_code: this.codigo.toUpperCase() });

      // Al vincular con éxito, redirige al Dashboard
      this.navCtrl.navigateRoot('/dashboard');
    } catch (error: any) {
      console.error('Error al vincular refrigerador:', error);
      this.errorMsg = error.message || 'No se pudo vincular el dispositivo. Verifica el código.';
    } finally {
      this.guardando = false;
    }
  }
}