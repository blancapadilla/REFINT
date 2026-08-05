import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonFooter
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  settingsOutline,
  alertCircleOutline,
  timeOutline,
  closeCircleOutline,
  calendarOutline,
  basketOutline,
  cloudOutline,
  homeOutline,
  cartOutline,
  syncOutline,
  listOutline
} from 'ionicons/icons';

interface AlertItem {
  type: 'critical' | 'warning' | 'yellow' | 'success';
  icon: string;
  title: string;
  time: string;
  description: string;
  action?: string;
  secondaryAction?: string;
  status?: string;
}

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonFooter
  ]
})
export class AlertasPage {
  alerts: AlertItem[] = [
    {
      type: 'critical',
      icon: 'close-circle-outline',
      title: 'Leche Entera (2L)',
      time: 'Hace 5 min',
      description:
        'El producto está completamente agotado. No quedan existencias en el compartimiento principal.',
      action: 'Añadir al Carrito',
      secondaryAction: 'Omitir'
    },
    {
      type: 'warning',
      icon: 'calendar-outline',
      title: 'Yogur Griego Natural',
      time: 'Hace 1 hora',
      description:
        'Vence mañana. Se recomienda consumir pronto o usar en recetas de repostería.',
      action: 'Ver Recetas',
      status: '85% expirado'
    },
    {
      type: 'yellow',
      icon: 'basket-outline',
      title: 'Huevos (Docena)',
      time: 'Hace 3 horas',
      description:
        'Quedan solo 2 unidades. Tu consumo promedio indica que necesitarás más en 2 días.',
      action: 'Comprar'
    },
    {
      type: 'success',
      icon: 'cloud-outline',
      title: 'Inventario Sincronizado',
      time: 'Hoy, 08:45 AM',
      description:
        'Se han actualizado 12 artículos correctamente después de tu visita al supermercado.',
      action: 'Ver detalles'
    }
  ];

  constructor() {
    addIcons({
      'settings-outline': settingsOutline,
      'alert-circle-outline': alertCircleOutline,
      'time-outline': timeOutline,
      'close-circle-outline': closeCircleOutline,
      'calendar-outline': calendarOutline,
      'basket-outline': basketOutline,
      'cloud-outline': cloudOutline,
      'home-outline': homeOutline,
      'cart-outline': cartOutline,
      'sync-outline': syncOutline,
      'list-outline': listOutline
    });
  }
}