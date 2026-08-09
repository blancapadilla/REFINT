import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  eyeOutline, 
  eyeOffOutline, 
  arrowForwardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  mostrarPassword = false;
  loading = false;
  authError = '';
  authInfo = '';

  mailOutline = mailOutline;
  lockClosedOutline = lockClosedOutline;
  eyeOutline = eyeOutline;
  eyeOffOutline = eyeOffOutline;
  arrowForwardOutline = arrowForwardOutline;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline
    });
  }

  ngOnInit() {}

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  async iniciarSesion() {
    this.authError = '';
    this.authInfo = '';

    if (!this.email || !this.password) {
      this.authError = 'Ingresa tu correo y contraseña.';
      return;
    }

    try {
      this.loading = true;

      const { data, error } = await this.authService.signInWithPassword(
        this.email.trim(),
        this.password
      );

      if (error || !data.session) {
        this.authError = error?.message ?? 'No se pudo iniciar sesión.';
        return;
      }

      await this.router.navigate(['/inventario']);
    } catch (e) {
      this.authError = 'Error de conexión con Supabase.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async irARegistro() {
    this.authError = '';
    this.authInfo = '';

    if (!this.email || !this.password) {
      this.authError = 'Para registrarte, ingresa correo y contraseña.';
      return;
    }

    if (this.password.length < 6) {
      this.authError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    try {
      this.loading = true;

      const { data, error } = await this.authService.signUpWithPassword(
        this.email.trim(),
        this.password
      );

      if (error) {
        this.authError = error.message;
        return;
      }

      if (data.session) {
        await this.router.navigate(['/inventario']);
        return;
      }

      this.authInfo = 'Cuenta creada. Revisa tu correo para confirmar tu registro.';
    } catch (e) {
      this.authError = 'Error de conexión con Supabase.';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  loginGoogle() {
    console.log('Iniciar sesión con Google');
    this.router.navigate(['/inventario']);
  }

  loginApple() {
    console.log('Iniciar sesión con Apple');
    this.router.navigate(['/inventario']);
  }

  recuperarPassword() {
    console.log('Recuperar contraseña');
  }

}