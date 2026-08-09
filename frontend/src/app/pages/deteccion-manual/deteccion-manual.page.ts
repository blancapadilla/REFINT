import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { SupabaseService } from '../../services/supabase';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-deteccion-manual',
  templateUrl: './deteccion-manual.page.html',
  styleUrls: ['./deteccion-manual.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, AppHeaderComponent],
})
export class DeteccionManualPage {
  imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3TXj0zkLLog0jzO0W69RSt8gUYhFP65ks2rowRErKthCyXpCHw2DTqXvBtYOty6D-sJD2LcKhApQwPkeH36sxa9n7bogO3zjKekCDyr3qPz3iFT41Y86jG2pi-PNrrBWAR_lD5jv439SWd3wWBDXbO1cLIsPtWtaHkSwJUBkddd2rWYq62EmGh1chm98JKf-S7la0YGw-xB7AXDPPTcWzZFM5PMebJ7mnv6wCwu6OosaiY5jovh2e';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private inventario: InventarioService
  ) {}

  volverAtras() {
    this.router.navigate(['/inventario']);
  }

  irAAgregar() {
    this.router.navigate(['/agregar-producto']);
  }

  async registrarManual() {
    // Pedir nombre y marca al usuario
    const nombre = window.prompt('Nombre del producto:');
    if (!nombre || !nombre.trim()) return;
    const marca = window.prompt('Marca (opcional):') || undefined;

    const client = this.supabase.client;

    try {
      // Obtener refrigerador
      const { data: fridge } = await client.from('refrigerators').select('id').limit(1).single();
      if (!fridge || !fridge.id) {
        alert('No se encontró un refrigerador activo.');
        return;
      }

      // Crear un registro de scan (manual)
      const now = new Date().toISOString();
      const { data: scanData, error: scanError } = await client
        .from('scans')
        .insert({
          refrigerator_id: fridge.id,
          started_at: now,
          finished_at: now,
          status: 'completed',
          original_image_path: this.imageUrl,
          detected_product_count: 1
        })
        .select('id')
        .limit(1)
        .single();

      if (scanError) console.warn('Error creando scan:', scanError);

      // Insertar producto + inventory
      const inv = await this.inventario.addProducto({
        nombre: nombre.trim(),
        marca,
        cantidad: 1,
        unidad: 'unidad',
        fechaVencimiento: undefined,
        notas: 'Agregado desde detección manual'
      });

      console.log('Inventory insert result:', inv);

      // Registrar detección asociada al scan si existe
      const productId = (inv as any)?.product_id ?? (inv as any)?.product_id;
      const scanId = (scanData as any)?.id ?? null;
      if (scanId) {
        await client.from('detections').insert({
          scan_id: scanId,
          predicted_label: nombre.trim(),
          product_id: productId ?? null,
          confidence: 1.0
        });
      }

      alert('Producto agregado al inventario correctamente.');
      this.router.navigate(['/inventario']);
    } catch (err) {
      console.error('Error en registro manual:', err);
      alert('Error al registrar manualmente: ' + ((err as any)?.message ?? err));
    }
  }
}
