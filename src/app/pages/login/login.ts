import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { auth } from '../../services/firebase.config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {

  isRegister = false;

  name = '';
  email = '';
  password = '';

  errorMsg = '';
  loading = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMsg = '';
  }

  async submit() {
    this.errorMsg = '';

    // Validaciones
    if (this.isRegister && !this.name.trim()) {
      this.errorMsg = 'Completa tu nombre.';
      return;
    }

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMsg = 'Completa correo y contraseña.';
      return;
    }

    this.loading = true;

    try {
      if (this.isRegister) {
        // 1. Crear cuenta en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, this.email, this.password);

        // 2. Guardar nombre en Firebase Auth
        await updateProfile(cred.user, { displayName: this.name });

        // 3. Guardar usuario en Firestore
        await this.userService.crearUsuarioFirestore(
          cred.user.uid,
          this.name,
          this.email
        );

      } else {
        // 1. Iniciar sesión con Firebase Auth
        const cred = await signInWithEmailAndPassword(auth, this.email, this.password);

        // 2. Cargar usuario desde Firestore
        const usuario = await this.userService.obtenerUsuario(cred.user.uid);

        if (!usuario) {
          this.errorMsg = 'El usuario existe en Auth pero no en Firestore.';
          return;
        }
      }

      // Redirección al home
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error(error);

      // Manejo técnico de errores Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMsg = 'Este correo ya está registrado.';
          break;
        case 'auth/invalid-email':
          this.errorMsg = 'Correo inválido.';
          break;
        case 'auth/weak-password':
          this.errorMsg = 'La contraseña es muy débil.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.errorMsg = 'Correo o contraseña incorrectos.';
          break;
        default:
          this.errorMsg = 'Ocurrió un error. Intenta nuevamente.';
      }
    } finally {
      this.loading = false;
    }
  }
}