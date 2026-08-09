import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { InventoryService } from '../../services/inventory';
import { AuthService } from '../../services/auth';

import { addIcons } from 'ionicons';

import {
  snowOutline,
  settingsOutline,
  searchOutline,
  filterOutline,
  calendarOutline,
  createOutline,
  trashOutline,
  addOutline,
  cubeOutline,
  cartOutline,
  syncOutline,
  timeOutline,
  notificationsOutline,
  analyticsOutline,
  alertCircleOutline,
  barChartOutline,
  wifiOutline,
  cameraOutline
} from 'ionicons/icons';


interface ProductoInventario {
  id: string;
  nombre: string;
  cantidad: string;
  categoria: string;
  estado: 'critical' | 'soon' | 'fresh';
  etiquetaEstado: string;
  vencimiento: string;
  imagen: string;
}


@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppHeaderComponent
  ]
})


export class InventarioPage implements OnInit {

  // =====================================================
  // DATOS GENERALES
  // =====================================================

  textoBusqueda: string = '';

  categoriaSeleccionada: string = 'todos';

  usuario = 'Vanessa';

  totalProductos = 0;

  chartGradient =
    'conic-gradient(#004ac6 0% 65%, #64a8fe 65% 85%, #006229 85% 100%)';


  // =====================================================
  // ICONOS
  // =====================================================

  snowOutline = snowOutline;
  settingsOutline = settingsOutline;
  searchOutline = searchOutline;
  filterOutline = filterOutline;
  calendarOutline = calendarOutline;
  createOutline = createOutline;
  trashOutline = trashOutline;
  addOutline = addOutline;
  cubeOutline = cubeOutline;
  cartOutline = cartOutline;
  syncOutline = syncOutline;
  timeOutline = timeOutline;
  notificationsOutline = notificationsOutline;
  analyticsOutline = analyticsOutline;
  alertCircleOutline = alertCircleOutline;
  barChartOutline = barChartOutline;
  wifiOutline = wifiOutline;
  cameraOutline = cameraOutline;


  // =====================================================
  // CATEGORÍAS
  // =====================================================

  categorias = [
    {
      id: 'todos',
      nombre: 'Todos'
    },
    {
      id: 'lacteos',
      nombre: 'Lácteos'
    },
    {
      id: 'vegetales',
      nombre: 'Vegetales'
    },
    {
      id: 'carnes',
      nombre: 'Carnes'
    },
    {
      id: 'bebidas',
      nombre: 'Bebidas'
    }
  ];


  // =====================================================
  // ACCIONES RÁPIDAS
  // =====================================================

  quickActions = [
    {
      type: 'sync',
      label: 'Sincronizar',
      icon: this.syncOutline
    },
    {
      type: 'scan',
      label: 'Escaneo Inteligente',
      icon: this.analyticsOutline
    },
    {
      type: 'stats',
      label: 'Ver Estadísticas',
      icon: this.barChartOutline
    },
    {
      type: 'alerts',
      label: 'Ver Alertas',
      icon: this.notificationsOutline
    }
  ];


  // =====================================================
  // TARJETAS DE ESTADO
  // Por ahora siguen siendo datos visuales.
  // Después las conectaremos con Supabase.
  // =====================================================

  statusCards = [
    {
      color: 'primary',
      icon: this.calendarOutline,
      title: 'Temperatura',
      value: '3 °C',
      subtitle: 'Óptima'
    },
    {
      color: 'secondary',
      icon: this.addOutline,
      title: 'Humedad',
      value: '45 %',
      subtitle: 'Nivel Estable'
    }
  ];


  // =====================================================
  // RESUMEN
  // =====================================================

  summaryCards = [
    {
      type: 'warning',
      title: 'Por vencer',
      value: '3',
      subtitle: 'Alimentos próximos a caducar'
    },
    {
      type: 'danger',
      title: 'Escaseando',
      value: '5',
      subtitle: 'Productos por reabastecer'
    }
  ];


  // =====================================================
  // PRODUCTOS PRÓXIMOS A VENCER
  // Por ahora siguen siendo visuales.
  // =====================================================

  expiringProducts = [
    {
      nombre: 'Leche Entera',
      image: 'assets/images/products/lecheentera.webp',
      vence: '1 día restante',
      progreso: 10,
      clase: 'danger'
    },
    {
      nombre: 'Espinacas',
      image: 'assets/images/products/espinacas.png',
      vence: '3 días restantes',
      progreso: 30,
      clase: 'warning'
    }
  ];


  // =====================================================
  // DISTRIBUCIÓN
  // =====================================================

  distributionLegend = [
    {
      color: 'primary',
      label: 'Lácteos & Huevos',
      percent: 65
    },
    {
      color: 'secondary',
      label: 'Vegetales',
      percent: 20
    },
    {
      color: 'tertiary',
      label: 'Proteínas',
      percent: 15
    }
  ];


  // =====================================================
  // RECETAS
  // =====================================================

  recipeSuggestions = [
    {
      title: 'Omelette Cremoso de Espinacas',
      description: 'Receta recomendada',
      variant: 'green',
      image: 'assets/images/recipes/omeleet.png'
    },
    {
      title: 'Quiche de Tres Quesos',
      description: 'Lácteos por vencer',
      variant: 'orange',
      image: 'assets/images/recipes/quiche.jpg'
    }
  ];


  // =====================================================
  // ESTADO DE DISPOSITIVOS
  // Después lo conectaremos a la tabla devices.
  // =====================================================

  deviceStatus = {

    esp: {
      label: 'ESP32 STATUS',
      value: 'Online',
      state: 'online'
    },

    camera: {
      label: 'CÁMARA',
      value: 'Activa',
      state: 'online'
    },

    wifi: {
      label: 'WIFI',
      value: 'Excelente',
      state: 'online'
    },

    temperature: {
      label: 'TEMPERATURA',
      value: '3°C Óptima',
      state: 'online'
    },

    lastSync: 'Hace 2 min'

  };


  // =====================================================
  // ACTIVIDAD RECIENTE
  // =====================================================

  recentActivity = [
    {
      icon: this.syncOutline,
      title: 'Inventario actualizado',
      subtitle: 'Hoy, 10:45 AM',
      time: 'Ahora',
      variant: 'primary'
    },
    {
      icon: this.cartOutline,
      title: 'Producto agregado',
      subtitle: 'Hoy, 09:12 AM',
      time: 'Reciente',
      variant: 'success'
    },
    {
      icon: this.alertCircleOutline,
      title: 'Alerta de vencimiento',
      subtitle: 'Ayer, 06:30 PM',
      time: 'Ayer',
      variant: 'warning'
    }
  ];


  // =====================================================
  // INVENTARIO
  // Ahora los productos vienen de Supabase.
  // =====================================================

  productos: ProductoInventario[] = [];

  productosFiltrados: ProductoInventario[] = [];


  // =====================================================
  // MENÚ INFERIOR
  // =====================================================

  bottomNavItems = [
    {
      id: 'inventory',
      label: 'Inventario',
      icon: cubeOutline,
      path: '/inventario',
      active: true
    },
    {
      id: 'shopping',
      label: 'Lista de Compras',
      icon: cartOutline,
      path: '/lista-compras',
      active: false
    },
    {
      id: 'sync',
      label: 'Sincronizar',
      icon: syncOutline,
      path: '/comparacion',
      active: false
    },
    {
      id: 'history',
      label: 'Historial',
      icon: timeOutline,
      path: '/historial',
      active: false
    },
    {
      id: 'alerts',
      label: 'Alertas',
      icon: notificationsOutline,
      path: '/alertas',
      active: false
    }
  ];


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private authService: AuthService
  ) {

    addIcons({
      snowOutline,
      settingsOutline,
      searchOutline,
      filterOutline,
      calendarOutline,
      createOutline,
      trashOutline,
      addOutline,
      cubeOutline,
      cartOutline,
      syncOutline,
      timeOutline,
      notificationsOutline,
      analyticsOutline,
      alertCircleOutline,
      barChartOutline,
      wifiOutline,
      cameraOutline
    });

  }


  // =====================================================
  // INICIO DE LA PÁGINA
  // =====================================================

  async ngOnInit() {

    const session = await this.authService.getSession();

    if (!session) {
      await this.router.navigate(['/login']);
      return;
    }

    await this.cargarInventario();

  }


  // =====================================================
  // OBTENER INVENTARIO DESDE SUPABASE
  // =====================================================

  async cargarInventario() {

    try {

      const data = await this.inventoryService.getInventory();

      console.log(
        'Datos recibidos de Supabase:',
        data
      );


      this.productos = (data ?? []).map(
        (item: any): ProductoInventario => {

          const estadoVisual =
            this.obtenerEstadoVisual(item);

          return {

            id: item.id,

            nombre:
              item.product_name ?? 'Producto',

            cantidad:
              `${item.quantity ?? 0} ${item.unit ?? ''}`.trim(),

            categoria:
              this.normalizarCategoria(
                item.category_name
              ),

            estado:
              estadoVisual,

            etiquetaEstado:
              this.obtenerEtiquetaEstado(
                estadoVisual
              ),

            vencimiento:
              this.formatearVencimiento(
                item.days_to_expiry,
                item.expires_on
              ),

            imagen:
              this.obtenerImagenProducto(item)

          };

        }
      );


      this.totalProductos =
        this.productos.length;


      this.productosFiltrados = [
        ...this.productos
      ];


      console.log(
        'Inventario preparado:',
        this.productos
      );

    } catch (error) {

      console.error(
        'Error cargando inventario desde Supabase:',
        error
      );

      this.productos = [];

      this.productosFiltrados = [];

      this.totalProductos = 0;

    }

  }


  // =====================================================
  // NORMALIZAR CATEGORÍAS DE SUPABASE
  // =====================================================

  normalizarCategoria(
    categoria: string | null | undefined
  ): string {

    if (!categoria) {
      return 'otros';
    }


    const nombre = categoria

      .normalize('NFD')

      .replace(
        /[\u0300-\u036f]/g,
        ''
      )

      .toLowerCase();


    if (
      nombre.includes('lacteo') ||
      nombre.includes('huevo')
    ) {

      return 'lacteos';

    }


    if (
      nombre.includes('fruta') ||
      nombre.includes('verdura') ||
      nombre.includes('vegetal')
    ) {

      return 'vegetales';

    }


    if (
      nombre.includes('carne') ||
      nombre.includes('proteina')
    ) {

      return 'carnes';

    }


    if (
      nombre.includes('bebida') ||
      nombre.includes('refresco') ||
      nombre.includes('jugo')
    ) {

      return 'bebidas';

    }


    return 'otros';

  }


  // =====================================================
  // CONVERTIR ESTADO DE SUPABASE AL DISEÑO
  // =====================================================

  obtenerEstadoVisual(
    item: any
  ): 'critical' | 'soon' | 'fresh' {

    if (
      item.status === 'caducado'
    ) {

      return 'critical';

    }


    if (
      item.status === 'agotado'
    ) {

      return 'critical';

    }


    const dias =
      item.days_to_expiry;


    if (
      dias === null ||
      dias === undefined
    ) {

      return 'fresh';

    }


    if (
      Number(dias) <= 1
    ) {

      return 'critical';

    }


    if (
      Number(dias) <= 3
    ) {

      return 'soon';

    }


    return 'fresh';

  }


  // =====================================================
  // ETIQUETA VISUAL
  // =====================================================

  obtenerEtiquetaEstado(
    estado: 'critical' | 'soon' | 'fresh'
  ): string {

    switch (estado) {

      case 'critical':

        return 'Crítico';


      case 'soon':

        return 'Pronto';


      default:

        return 'Fresco';

    }

  }


  // =====================================================
  // FORMATEAR FECHA DE VENCIMIENTO
  // =====================================================

  formatearVencimiento(
    dias: number | null | undefined,
    fecha: string | null | undefined
  ): string {

    if (!fecha) {

      return 'Sin fecha de vencimiento';

    }


    if (
      dias === null ||
      dias === undefined
    ) {

      return `Vence: ${fecha}`;

    }


    const diasNumero =
      Number(dias);


    if (
      diasNumero < 0
    ) {

      return 'Caducado';

    }


    if (
      diasNumero === 0
    ) {

      return 'Vence: Hoy';

    }


    if (
      diasNumero === 1
    ) {

      return 'Vence: Mañana';

    }


    if (
      diasNumero <= 7
    ) {

      return `Vence en ${diasNumero} días`;

    }


    const fechaFormateada =
      new Date(
        `${fecha}T00:00:00`
      ).toLocaleDateString(
        'es-MX',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }
      );


    return `Vence: ${fechaFormateada}`;

  }


  // =====================================================
  // IMÁGENES DE PRODUCTOS
  // =====================================================

  obtenerImagenProducto(
    item: any
  ): string {

    // Si Supabase ya devuelve una URL completa,
    // utilizarla directamente.

    if (
      item.product_image_path &&
      (
        item.product_image_path.startsWith('http://') ||
        item.product_image_path.startsWith('https://')
      )
    ) {

      return item.product_image_path;

    }


    if (
      item.image_path &&
      (
        item.image_path.startsWith('http://') ||
        item.image_path.startsWith('https://')
      )
    ) {

      return item.image_path;

    }


    // Imágenes locales temporales
    // para los datos demo.

    const nombre =
      (item.product_name ?? '')
        .toLowerCase();


    if (
      nombre.includes('leche')
    ) {

      return 'assets/images/products/lecheentera.webp';

    }


    if (
      nombre.includes('espinaca')
    ) {

      return 'assets/images/products/espinacas.png';

    }


    // Imagen genérica si todavía
    // no existe fotografía del producto.

    return 'assets/images/products/default-product.png';

  }


  // =====================================================
  // ACCIONES RÁPIDAS
  // =====================================================

  ejecutarAccion(
    action: string
  ) {

    switch (action) {

      case 'sync':

        this.router.navigate([
          '/comparacion'
        ]);

        break;


      case 'scan':

        this.router.navigate([
          '/escaneo-inteligente'
        ]);

        break;


      case 'stats':

        this.router.navigate([
          '/estadisticas'
        ]);

        break;


      case 'alerts':

        this.router.navigate([
          '/alertas'
        ]);

        break;

    }

  }


  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  irADashboard() {

    this.router.navigate([
      '/inventario'
    ]);

  }


  irAConfiguracion() {

    this.router.navigate([
      '/configuracion'
    ]);

  }


  buscar() {

    console.log(
      'Abrir búsqueda de inventario'
    );

  }


  irA(
    ruta: string
  ) {

    this.router.navigate([
      ruta
    ]);

  }


  navegar(
    item: any
  ) {

    if (
      item.path
    ) {

      this.router.navigate([
        item.path
      ]);

    }

  }


  // =====================================================
  // FILTROS
  // =====================================================

  seleccionarCategoria(
    catId: string
  ) {

    this.categoriaSeleccionada =
      catId;

    this.aplicarFiltros();

  }


  aplicarFiltros() {

    const busqueda =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    this.productosFiltrados =
      this.productos.filter(
        item => {

          const coincideBusqueda =
            item.nombre
              .toLowerCase()
              .includes(
                busqueda
              );


          const coincideCategoria =
            this.categoriaSeleccionada ===
              'todos' ||

            item.categoria ===
              this.categoriaSeleccionada;


          return (
            coincideBusqueda &&
            coincideCategoria
          );

        }
      );

  }


  // =====================================================
  // PRODUCTOS
  // Por ahora estos botones mantienen el comportamiento
  // visual existente.
  // Después conectaremos INSERT / UPDATE / DELETE.
  // =====================================================

  agregarProducto() {

    console.log(
      'Abrir formulario para agregar alimento'
    );

  }


  editarProducto(
    item: ProductoInventario
  ) {

    console.log(
      'Editar producto:',
      item.nombre
    );

  }


  eliminarProducto(
    item: ProductoInventario
  ) {

    console.log(
      'Eliminar producto:',
      item.nombre
    );


    // Por ahora lo quitamos visualmente.
    // Luego conectaremos DELETE con Supabase.

    this.productos =
      this.productos.filter(
        producto =>
          producto.id !== item.id
      );


    this.totalProductos =
      this.productos.length;


    this.aplicarFiltros();

  }

}