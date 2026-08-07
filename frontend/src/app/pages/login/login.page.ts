import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
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

  mailOutline = mailOutline;
  lockClosedOutline = lockClosedOutline;
  eyeOutline = eyeOutline;
  eyeOffOutline = eyeOffOutline;
  arrowForwardOutline = arrowForwardOutline;

  constructor(private router: Router) {
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

  iniciarSesion() {
    // Lógica de autenticación e ingreso al dashboard
    this.router.navigate(['/dashboard']);
  }

  loginGoogle() {
    console.log('Iniciar sesión con Google');
    this.router.navigate(['/dashboard']);
  }

  loginApple() {
    console.log('Iniciar sesión con Apple');
    this.router.navigate(['/dashboard']);
  }

  recuperarPassword() {
    console.log('Recuperar contraseña');
  }

  irARegistro() {
    console.log('Navegar a pantalla de registro');
  }
}