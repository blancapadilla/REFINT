import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { InventarioService } from '../../services/inventario.service';
import { AppHeaderComponent } from '../../shared/components/app-header/app-header.component';
import { addIcons } from 'ionicons';
import {
  cubeOutline,
  calendarOutline,
  layersOutline,
  pricetagOutline,
  imageOutline,
  checkmarkOutline,
  closeOutline
} from 'ionicons/icons';

interface ProductoForm {
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
  fechaVencimiento: string;
  marca: string;
  notas: string;
}

@Component({
  selector: 'app-agregar-producto',
  templateUrl: './agregar-producto.page.html',
  styleUrls: ['./agregar-producto.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, AppHeaderComponent]
})
export class AgregarProductoPage {
  guardando = false;
  mensajeExito = false;

  categorias = [
    { id: 'lacteos',   label: 'Lácteos & Huevos' },
    { id: 'vegetales', label: 'Vegetales' },
    { id: 'carnes',    label: 'Carnes & Proteínas' },
    { id: 'bebidas',   label: 'Bebidas' },
    { id: 'congelados',label: 'Congelados' },
    { id: 'otros',     label: 'Otros' }
  ];

  unidades = ['unidad', 'kg', 'g', 'litro', 'ml', 'docena', 'paquete', 'lata', 'botella'];

  producto: ProductoForm = {
    nombre: '',
    categoria: '',
    cantidad: 1,
    unidad: 'unidad',
    fechaVencimiento: '',
    marca: '',
    notas: ''
  };

  cubeOutline     = cubeOutline;
  calendarOutline = calendarOutline;
  layersOutline   = layersOutline;
  pricetagOutline = pricetagOutline;
  imageOutline    = imageOutline;
  checkmarkOutline = checkmarkOutline;
  closeOutline    = closeOutline;

  constructor(private router: Router, private inventario: InventarioService) {
    addIcons({ cubeOutline, calendarOutline, layersOutline, pricetagOutline, imageOutline, checkmarkOutline, closeOutline });
  }

  formularioValido(): boolean {
    return this.producto.nombre.trim().length > 0 && this.producto.categoria !== '';
  }

  async guardar() {
    if (!this.formularioValido()) return;

    this.guardando = true;
    try {
      const res = await this.inventario.addProducto({
        nombre: this.producto.nombre,
        marca: this.producto.marca,
        categoria: this.producto.categoria,
        cantidad: this.producto.cantidad,
        unidad: this.producto.unidad,
        fechaVencimiento: this.producto.fechaVencimiento,
        notas: this.producto.notas
      });
      console.log('Producto insertado:', res);
    } catch (err: any) {
      console.error('Error guardando producto:', err);
      alert('Error guardando producto: ' + (err?.message || err));
      this.guardando = false;
      return;
    }
    this.guardando = false;
    this.mensajeExito = true;

    setTimeout(() => this.router.navigate(['/inventario']), 1200);
  }

  cancelar() {
    window.history.back();
  }
}
