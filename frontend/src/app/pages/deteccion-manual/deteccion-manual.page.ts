import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-deteccion-manual',
  templateUrl: './deteccion-manual.page.html',
  styleUrls: ['./deteccion-manual.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class DeteccionManualPage {
  constructor(private router: Router) {}

  volverAtras() {
    this.router.navigate(['/inventario']);
  }

  irAAgregar() {
    this.router.navigate(['/agregar-producto']);
  }
}
