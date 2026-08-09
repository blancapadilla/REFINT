import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { RefrigeradorService } from '../../services/refrigerador.service';
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

  cubeOutline    = cubeOutline;
  qrCodeOutline  = qrCodeOutline;
  checkmarkOutline = checkmarkOutline;

  constructor(
    private router: Router,
    private refrigeradorService: RefrigeradorService
  ) {
    addIcons({ cubeOutline, qrCodeOutline, checkmarkOutline });
  }

  valido(): boolean {
    return this.nombre.trim().length > 0 && this.codigo.trim().length > 0;
  }

  regresarConfiguracion(): void {
    void this.router.navigate(['/configuracion']);
  }

  async registrar() {
    if (!this.valido()) return;
    this.errorMsg = '';
    this.guardando = true;

    try {
      await this.refrigeradorService.registrar(
        this.nombre.trim(),
        this.codigo.trim().toUpperCase()
      );
      await this.router.navigate(['/inventario']);
    } catch (e: any) {
      this.errorMsg = e?.message ?? 'Error al registrar el refrigerador.';
    } finally {
      this.guardando = false;
    }
  }
}
