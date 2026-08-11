import { CommonModule } from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  IonicModule,
  ToastController,
  AlertController
} from '@ionic/angular';

import { Router } from '@angular/router';

import { RealtimeChannel } from '@supabase/supabase-js';

import { addIcons } from 'ionicons';

import {
  cartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  cubeOutline,
  imageOutline,
  notificationsOutline,
  syncOutline,
  timeOutline,
  warningOutline,
  alertCircleOutline
} from 'ionicons/icons';

import {
  RefrigeradorService
} from '../../services/refrigerador.service';

import {
  Scan,
  ScanChange,
  ScanChangeType,
  SyncService,
  InventarioSyncItem,
  ResumenInventario
} from '../../services/sync.service';

import {
  AppHeaderComponent
} from '../../shared/components/app-header/app-header.component';


/* ==========================================================
   ESTADOS DE LA PANTALLA
   ========================================================== */

type ViewState =
  | 'loading'
  | 'empty'
  | 'no-changes'
  | 'error'
  | 'success';


@Component({
  selector: 'app-comparacion',

  templateUrl:
    './comparacion.page.html',

  styleUrls:
    ['./comparacion.page.scss'],

  standalone: true,

  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent
  ]
})


export class ComparacionPage implements OnInit, OnDestroy {
  readonly alertCircleOutline = alertCircleOutline;


  /* ==========================================================
     ICONOS
     ========================================================== */

  readonly checkmarkCircleOutline =
    checkmarkCircleOutline;

  readonly warningOutline =
    warningOutline;

  readonly closeCircleOutline =
    closeCircleOutline;

  readonly imageOutline =
    imageOutline;

  readonly timeOutline =
    timeOutline;


  /* ==========================================================
     ESTADO DE LA PANTALLA
     ========================================================== */

  state: ViewState = 'loading';


  /* ==========================================================
     INFORMACIÓN DEL ESCANEO
     ========================================================== */

  scan: Scan | null = null;

  changes: ScanChange[] = [];


  /* ==========================================================
     INVENTARIO
     ========================================================== */

  productosCriticos:
    InventarioSyncItem[] = [];

  resumenInventario:
    ResumenInventario | null = null;


  /* ==========================================================
     CONTROL
     ========================================================== */

  confirming = false;

  actualizandoShopping = false;


  /* ==========================================================
     REFRIGERADOR
     ========================================================== */

  private refrigeratorId:
    string | null = null;


  /* ==========================================================
     REALTIME
     ========================================================== */

  private scansChannel:
    RealtimeChannel | null = null;


  /* ==========================================================
     NAVEGACIÓN INFERIOR
     ========================================================== */

  bottomNavItems = [
    { id: 'inventory', label: 'Inventario', icon: cubeOutline, path: '/inventario', active: false },
    { id: 'shopping', label: 'Compras', icon: cartOutline, path: '/lista-compras', active: false },
    { id: 'sync', label: 'Sincronizar', icon: syncOutline, path: '/comparacion', active: true },
    { id: 'history', label: 'Historial', icon: timeOutline, path: '/historial', active: false },
    { id: 'alerts', label: 'Alertas', icon: notificationsOutline, path: '/alertas', active: false }
  ];


  /* ==========================================================
     CONSTRUCTOR
     ========================================================== */

  constructor(

    private readonly router: Router,

    private readonly syncService:
      SyncService,

    private readonly refrigeradorService:
      RefrigeradorService,

    private readonly alertController:
      AlertController,

    private readonly toastController:
      ToastController

  ) {

    addIcons({

      cartOutline,

      checkmarkCircleOutline,

      closeCircleOutline,

      cubeOutline,

      imageOutline,

      notificationsOutline,

      syncOutline,

      timeOutline,

      warningOutline,
      alertCircleOutline

    });

  }

  formatSubtext(item: InventarioSyncItem): string {
    if (item.estado === 'caducado') {
      const dias = Math.abs(item.days_to_expiry || 0);
      return `Caducó hace ${dias} día(s)`;
    }
    if (item.estado === 'faltante') {
      if (item.days_to_expiry === 0) return 'Vence HOY';
      if (item.days_to_expiry != null && item.days_to_expiry > 0) return `Vence en ${item.days_to_expiry} día(s)`;
      return `Quedan: ${item.cantidad} ${item.unidad}`;
    }
    return `Quedan: ${item.cantidad} ${item.unidad}`;
  }


  /* ==========================================================
     INICIALIZAR
     ========================================================== */

  ngOnInit(): void {

    void this.initialize();

  }


  /* ==========================================================
     DESTRUIR
     ========================================================== */

  ngOnDestroy(): void {

    if (this.scansChannel) {

      void this.syncService.unsubscribe(
        this.scansChannel
      );

      this.scansChannel = null;

    }

  }


  /* ==========================================================
     INICIALIZAR PANTALLA
     ========================================================== */

  private async initialize():
    Promise<void> {

    try {

      this.state = 'loading';


      /* ------------------------------------------------------
         OBTENER REFRIGERADOR DEL USUARIO
         ------------------------------------------------------ */

      const refrigerator =
        await this.refrigeradorService
          .getMiRefrigerador();


      if (!refrigerator) {

        this.resumenInventario = null;

        this.productosCriticos = [];

        this.scan = null;

        this.changes = [];

        this.state = 'empty';

        return;

      }


      /* ------------------------------------------------------
         GUARDAR ID
         ------------------------------------------------------ */

      this.refrigeratorId =
        refrigerator.id;


      /* ------------------------------------------------------
         PRIMERO CARGAMOS INVENTARIO
         ------------------------------------------------------ */

      await this.loadInventario();


      /* ------------------------------------------------------
         DESPUÉS CARGAMOS EL ÚLTIMO ESCANEO
         ------------------------------------------------------ */

      await this.loadResults(false);


      /* ------------------------------------------------------
         REALTIME
         ------------------------------------------------------ */

      this.scansChannel =
        this.syncService
          .subscribeToCompletedScans(

            refrigerator.id,

            () => {

              void this.loadResults(false);

              void this.loadInventario();

            }

          );


    } catch (error) {

      console.error(
        'Error inicializando sincronización:',
        error
      );

      this.state = 'error';

    }

  }


  /* ==========================================================
     CARGAR ÚLTIMO ESCANEO
     ========================================================== */

  async loadResults(
    showLoading = true
  ): Promise<void> {

    if (!this.refrigeratorId) {

      return;

    }


    if (showLoading) {

      this.state = 'loading';

    }


    try {

      /* ------------------------------------------------------
         BUSCAR ÚLTIMO SCAN COMPLETADO
         ------------------------------------------------------ */

      this.scan =
        await this.syncService
          .getLatestCompletedScan(
            this.refrigeratorId
          );


      /* ------------------------------------------------------
         SI NO EXISTE SCAN
         ------------------------------------------------------ */

      if (!this.scan) {

        this.changes = [];

        /*
         * IMPORTANTE:
         * No ponemos error.
         * El inventario puede seguir mostrándose
         * aunque todavía no exista un scan.
         */

        if (
          this.resumenInventario &&
          this.resumenInventario.total > 0
        ) {

          this.state = 'no-changes';

        } else {

          this.state = 'empty';

        }

        return;

      }


      /* ------------------------------------------------------
         OBTENER CAMBIOS
         ------------------------------------------------------ */

      this.changes =
        await this.syncService
          .getScanChanges(
            this.scan.id
          );


      /* ------------------------------------------------------
         DETERMINAR ESTADO
         ------------------------------------------------------ */

      this.state =
        this.changes.length > 0
          ? 'success'
          : 'no-changes';


    } catch (error) {

      console.error(
        'Error cargando resultados:',
        error
      );

      /*
       * Si el inventario sí cargó,
       * no escondemos la pantalla completa.
       */

      if (
        this.resumenInventario &&
        this.resumenInventario.total > 0
      ) {

        this.state = 'no-changes';

      } else {

        this.state = 'error';

      }

    }

  }


  /* ==========================================================
     CARGAR INVENTARIO
     ========================================================== */

  async loadInventario():
    Promise<void> {

    if (!this.refrigeratorId) {

      return;

    }


    try {

      /* ------------------------------------------------------
         PRODUCTOS CRÍTICOS
         ------------------------------------------------------ */

      this.productosCriticos =
        await this.syncService
          .getInventarioCritico(
            this.refrigeratorId
          );


      /* ------------------------------------------------------
         RESUMEN
         ------------------------------------------------------ */

      this.resumenInventario =
        await this.syncService
          .getResumenInventario(
            this.refrigeratorId
          );


    } catch (error) {

      console.error(
        'Error cargando inventario:',
        error
      );

      this.productosCriticos = [];

      this.resumenInventario = null;

    }

  }


  /* ==========================================================
     RESUMEN DE CAMBIOS DEL ESCANEO
     ========================================================== */

  get summary(): {
    unchanged: number;
    added: number;
    removed: number;
  } {

    return {

      unchanged:
        this.changes.filter(
          change =>
            change.difference === 0
        ).length,

      added:
        this.changes.filter(
          change =>
            change.difference > 0
        ).length,

      removed:
        this.changes.filter(
          change =>
            change.difference < 0
        ).length

    };

  }


  /* ==========================================================
     CAMBIOS YA CONFIRMADOS
     ========================================================== */

  get alreadyConfirmed(): boolean {

    return (

      this.changes.length > 0 &&

      this.changes.every(

        change =>

          change.confirmation_status
            ?.toLowerCase() ===
          'accepted'

      )

    );

  }


  /* ==========================================================
     DIFERENCIA
     ========================================================== */

  formatDifference(
    change: ScanChange
  ): string {

    if (
      change.difference === 0
    ) {

      return 'Sin cambios';

    }


    return (

      `${change.difference > 0 ? '+' : ''}` +

      `${change.difference} ` +

      `${change.unit}`

    );

  }


  /* ==========================================================
     TIPO DE CAMBIO
     ========================================================== */

  changeTypeLabel(
    type: ScanChangeType
  ): string {

    const labels:
      Record<
        ScanChangeType,
        string
      > = {

        added:
          'Agregado',

        removed:
          'Retirado',

        quantity_changed:
          'Cantidad modificada',

        unchanged:
          'Sin cambios'

      };


    return labels[type];

  }


  /* ==========================================================
     OBTENER IMAGEN
     ========================================================== */

  imageUrl(
    value:
      ScanChange |
      InventarioSyncItem |
      string |
      null |
      undefined
  ): string | null {

    if (!value) {

      return null;

    }


    /* ------------------------------------------------------
       SI ES STRING
       ------------------------------------------------------ */

    if (
      typeof value === 'string'
    ) {

      return /^https?:\/\//i.test(
        value
      )
        ? value
        : null;

    }


    /* ------------------------------------------------------
       SCAN CHANGE
       ------------------------------------------------------ */

    if (
      'products' in value
    ) {

      const path =
        value.products?.image_path;


      if (
        path &&
        /^https?:\/\//i.test(path)
      ) {

        return path;

      }


      return null;

    }


    /* ------------------------------------------------------
       INVENTARIO
       ------------------------------------------------------ */

    const path =
      value.imagen;


    if (
      path &&
      /^https?:\/\//i.test(path)
    ) {

      return path;

    }


    return null;

  }


  /* ==========================================================
     FECHA
     ========================================================== */

  formatDate(
    value: string
  ): string {

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(
      new Date(value)
    );

  }


  /* ==========================================================
     TIEMPO DE PROCESAMIENTO
     ========================================================== */

  formatProcessing(
    ms: number | null
  ): string {

    if (ms === null) {

      return 'Tiempo no disponible';

    }


    return (

      `Procesado en ` +

      `${(
        ms / 1000
      ).toLocaleString(
        'es-MX',
        {
          maximumFractionDigits: 2
        }
      )} s`

    );

  }


  /* ==========================================================
     CONFIRMAR CAMBIOS
     ========================================================== */

  async confirmChanges():
    Promise<void> {

    if (
      !this.scan ||
      this.confirming ||
      this.alreadyConfirmed
    ) {

      return;

    }


    const alert =
      await this.alertController.create({

        header:
          '¿Confirmar los cambios detectados?',

        message:
          'El inventario será actualizado con los resultados de este análisis.',

        buttons: [

          {
            text:
              'Cancelar',

            role:
              'cancel'
          },

          {

            text:
              'Confirmar',

            role:
              'confirm',

            handler: () =>
              void this.applyChanges()

          }

        ]

      });


    await alert.present();

  }


  /* ==========================================================
     APLICAR CAMBIOS DEL ESCANEO
     ========================================================== */

  private async applyChanges():
    Promise<void> {

    if (!this.scan) {

      return;

    }


    this.confirming = true;


    try {

      await this.syncService
        .applyScanChanges(
          this.scan.id
        );


      await this.loadResults(false);

      await this.loadInventario();


      await this.showToast(
        'Cambios confirmados correctamente.',
        'success'
      );


    } catch (error) {

      console.error(
        'Error confirmando cambios:',
        error
      );


      await this.showToast(
        'No fue posible confirmar los cambios.',
        'danger'
      );


    } finally {

      this.confirming = false;

    }

  }


  /* ==========================================================
     ACTUALIZAR SHOPPING LIST
     ========================================================== */

  async actualizarShoppingList():
    Promise<void> {

    if (
      this.actualizandoShopping
    ) {

      return;

    }


    /* ------------------------------------------------------
       COMPROBAR PRODUCTOS
       ------------------------------------------------------ */

    if (
      this.productosCriticos.length === 0
    ) {

      await this.showToast(
        'No hay productos críticos para agregar.',
        'warning'
      );

      return;

    }


    this.actualizandoShopping = true;


    try {

      await this.syncService
        .actualizarShoppingList(
          this.productosCriticos
        );


      await this.showToast(
        'Shopping List actualizada correctamente.',
        'success'
      );


      await this.router.navigate([
        '/lista-compras'
      ]);


    } catch (error) {

      console.error(
        'Error actualizando Shopping List:',
        error
      );


      await this.showToast(
        'No fue posible actualizar la Shopping List.',
        'danger'
      );


    } finally {

      this.actualizandoShopping =
        false;

    }

  }


  /* ==========================================================
     TOAST
     ========================================================== */

  private async showToast(

    message: string,

    color:
      'success' |
      'danger' |
      'warning'

  ): Promise<void> {

    const toast =
      await this.toastController.create({

        message,

        duration: 2500,

        color,

        position: 'top'

      });


    await toast.present();

  }


  /* ==========================================================
     BUSCAR
     ========================================================== */

  buscar(): void {

    /*
     * Acción del encabezado.
     * Se conserva para no romper AppHeader.
     */

  }


  /* ==========================================================
     NAVEGAR
     ========================================================== */

  navegar(
    item: {
      path: string
    }
  ): void {

    void this.router.navigate([
      item.path
    ]);

  }

}