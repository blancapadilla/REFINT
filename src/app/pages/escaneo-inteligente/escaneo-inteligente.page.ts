import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';

@Component({
  selector: 'app-escaneo-inteligente',
  templateUrl: './escaneo-inteligente.page.html',
  styleUrls: ['./escaneo-inteligente.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class EscaneoInteligentePage implements AfterViewInit {
  scanStatus = 'Analizando inventario...';
  scanLog = [
    { icon: 'visibility', text: 'Detectando: Leche Entera...' },
    { icon: 'checkmark-circle-outline', text: 'Procesando forma y etiqueta' },
    { icon: 'visibility', text: 'Detectando: Huevos (Docena)...' }
  ];
  resultsReady = false;
  updateDisabled = true;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    const messages = [
      'Analizando inventario...',
      'Procesando imágenes (Estante 1)...',
      'Comparando con inventario anterior...',
      'Generando resumen de cambios...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < messages.length) {
        this.scanStatus = messages[step];
        this.scanLog.unshift({ icon: 'memory', text: `Procesando sector ${step + 1}` });
      } else {
        clearInterval(interval);
        this.scanStatus = 'Escaneo completado. Revisa los cambios.';
        this.resultsReady = true;
        this.updateDisabled = false;
      }
    }, 1800);
  }

  volverAtras() {
    this.router.navigate(['/inventario']);
  }

  confirmarCambios() {
    if (!this.updateDisabled) {
      this.router.navigate(['/comparacion']);
    }
  }
}
