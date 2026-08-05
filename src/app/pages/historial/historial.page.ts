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
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonFooter
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  settingsOutline,
  notificationsOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  chevronDownOutline,
  homeOutline,
  listOutline,
  alertCircleOutline
} from 'ionicons/icons';

interface Activity {
  title: string;
  description: string;
  time: string;
  icon: string;
  color: 'danger' | 'primary' | 'gray';
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
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
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonFooter
  ]
})
export class HistorialPage {
  todayActivities: Activity[] = [
    {
      title: 'Alerta de caducidad',
      description: 'Yogur Griego está a punto de vencer.',
      time: '10:45 AM',
      icon: 'notifications-outline',
      color: 'danger'
    },
    {
      title: 'Leche agregada',
      description: 'Se detectaron 2 unidades nuevas.',
      time: '09:20 AM',
      icon: 'cube-outline',
      color: 'primary'
    }
  ];

  yesterdayActivities: Activity[] = [
    {
      title: 'Espinacas agotadas',
      description: 'Añadido automáticamente a Shopping.',
      time: '07:15 PM',
      icon: 'cart-outline',
      color: 'gray'
    },
    {
      title: 'Sincronización completa',
      description: 'Base de datos actualizada...',
      time: '12:30 PM',
      icon: 'sync-outline',
      color: 'gray'
    }
  ];

  constructor() {
    addIcons({
      'settings-outline': settingsOutline,
      'notifications-outline': notificationsOutline,
      'cube-outline': cubeOutline,
      'cart-outline': cartOutline,
      'sync-outline': syncOutline,
      'chevron-down-outline': chevronDownOutline,
      'home-outline': homeOutline,
      'list-outline': listOutline,
      'alert-circle-outline': alertCircleOutline
    });
  }
}