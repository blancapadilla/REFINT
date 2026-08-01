import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
// Ionicons imports to ensure icons are registered and available
import {
  snowOutline,
  searchOutline,
  notificationsOutline,
  personCircleOutline,
  settingsOutline,
  syncOutline,
  alertCircleOutline,
  thermometerOutline,
  waterOutline,
  flashOutline,
  wifiOutline,
  cubeOutline,
  timeOutline,
  nutritionOutline,
  pizzaOutline,
  leafOutline,
  restaurantOutline,
  scanOutline,
  personOutline,
  homeOutline,
} from 'ionicons/icons';

interface ActionButton {
  label: string;
  icon: string;
  type: 'primary' | 'secondary';
}

interface StatusCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
}

interface SummaryCard {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  type: 'warning' | 'danger';
}

interface ProductItem {
  nombre: string;
  vence: string;
  cantidad: string;
  clase: string;
  progreso: number;
  image?: string;
}

interface LegendItem {
  label: string;
  color: 'primary' | 'success' | 'warning';
}

interface RecipeSuggestion {
  title: string;
  description: string;
  icon: string;
  variant: 'default' | 'orange';
}

interface NavigationItem {
  label: string;
  icon: string;
  active?: boolean;
  special?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage {
  usuario = 'Vanessa';
  temperatura = 3;
  humedad = 45;
  totalProductos = 42;
  porVencer = 3;
  escaseando = 5;
  ultimaSync = 'Hace 2 min';

  // Expose imported icons for template binding
  snowOutline = snowOutline;
  searchOutline = searchOutline;
  notificationsOutline = notificationsOutline;
  personCircleOutline = personCircleOutline;
  syncOutline = syncOutline;
  alertCircleOutline = alertCircleOutline;
  thermometerOutline = thermometerOutline;
  waterOutline = waterOutline;
  flashOutline = flashOutline;
  wifiOutline = wifiOutline;
  cubeOutline = cubeOutline;
  timeOutline = timeOutline;
  nutritionOutline = nutritionOutline;
  pizzaOutline = pizzaOutline;
  leafOutline = leafOutline;
  restaurantOutline = restaurantOutline;
  scanOutline = scanOutline;
  personOutline = personOutline;
  homeOutline = homeOutline;
  settingsOutline = settingsOutline;

  quickActions: ActionButton[] = [
    { label: 'Sincronizar', icon: syncOutline, type: 'primary' },
    { label: 'Alertas', icon: alertCircleOutline, type: 'secondary' },
  ];

  statusCards: StatusCard[] = [
    {
      title: 'Temperatura',
      value: `${this.temperatura}°C`,
      subtitle: 'Óptima',
      icon: thermometerOutline,
      color: 'danger',
    },
    {
      title: 'Humedad',
      value: `${this.humedad}%`,
      subtitle: 'Nivel estable',
      icon: waterOutline,
      color: 'primary',
    },
    {
      title: 'ESP32 STATUS',
      value: 'Online',
      subtitle: 'Potencia de señal: Excelente',
      icon: wifiOutline,
      color: 'success',
    },
    {
      title: 'ÚLTIMA SINC.',
      value: 'Hace 2 min',
      subtitle: 'Auto-update habilitado',
      icon: timeOutline,
      color: 'warning',
    },
  ];

  summaryCards: SummaryCard[] = [
    {
      title: 'Por vencer',
      value: this.porVencer,
      subtitle: 'Próximos 7 días',
      icon: timeOutline,
      type: 'warning',
    },
    {
      title: 'Escaseando',
      value: this.escaseando,
      subtitle: 'Necesitan reposición',
      icon: alertCircleOutline,
      type: 'danger',
    },
  ];

  productos: ProductItem[] = [
    {
      nombre: 'Leche Entera',
      vence: '1 día restante',
      cantidad: '2L',
      clase: 'milk',
      progreso: 85,
      image: 'assets/images/products/lecheentera.webp',
    },
    {
      nombre: 'Espinacas',
      vence: '3 días restantes',
      cantidad: '300 g',
      clase: 'cheese',
      progreso: 55,
      image: 'assets/images/products/Espinacasss.jpeg',
    },
    {
      nombre: 'Queso Brie',
      vence: 'Vence mañana',
      cantidad: '500 g',
      clase: 'yogurt',
      progreso: 74,
      image: 'assets/images/products/quesoo.jpg',
    },
  ];

  // Distribution values (percent) used to build the donut
  distributionLegend: (LegendItem & { percent: number })[] = [
    { label: 'Lácteos & Huevos', color: 'primary', percent: 65 },
    { label: 'Vegetales', color: 'success', percent: 20 },
    { label: 'Proteínas', color: 'warning', percent: 15 },
  ];

  // Compute a CSS conic-gradient string for the donut chart
  get chartGradient(): string {
    let start = 0;
    const parts = this.distributionLegend.map((d) => {
      const end = start + d.percent;
      const color = d.color === 'primary' ? 'var(--primary)' : d.color === 'success' ? 'var(--success)' : 'var(--warning)';
      const seg = `${color} ${start}% ${end}%`;
      start = end;
      return seg;
    });
    return `conic-gradient(${parts.join(',')})`;
  }

  recipeSuggestions: (RecipeSuggestion & { image?: string })[] = [
    {
      title: 'Omelette cremoso de Espinacas',
      description: 'Usa tus espinacas antes de que se vuelvan a perder.',
      icon: restaurantOutline,
      variant: 'default',
      image: 'assets/images/recipes/omeleet.png',
    },
    {
      title: 'Quiche de Tres Quesos',
      description: 'Perfecto para aprovechar lácteos cercanos a vencer.',
      icon: pizzaOutline,
      variant: 'orange',
      image: 'assets/images/recipes/quiche.jpg',
    },
  ];

  bottomNavItems: NavigationItem[] = [
    { label: 'Inicio', icon: homeOutline, active: true },
    { label: 'Inventario', icon: cubeOutline },
    { label: 'Scan', icon: scanOutline, special: true },
    { label: 'Alertas', icon: notificationsOutline },
    { label: 'Perfil', icon: personOutline },
  ];
}
