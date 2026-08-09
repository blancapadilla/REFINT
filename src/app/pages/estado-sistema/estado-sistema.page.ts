import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-estado-sistema',
  templateUrl: './estado-sistema.page.html',
  styleUrls: ['./estado-sistema.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class EstadoSistemaPage {
  constructor(private router: Router) {}

  irAConfiguracion() {
    this.router.navigate(['/configuracion']);
  }
}
