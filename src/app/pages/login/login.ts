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

  nombre = '';
  email = '';
  password = '';

  errorMsg = '';
  loading = false;

  constructor(private router: Router, private userService: UserService) {}

  toggleMode() {
    this.isRegister = !this.isRegister;
    this.errorMsg = '';
  }

  async submit() {
    this.errorMsg = '';

    if (this.isRegister && !this.nombre) {
      this.errorMsg = 'Completa tu nombre.';
      return;
    }

    if (!this.email || !this.password) {
      this.errorMsg = 'Completa correo y contraseña.';
      return;
    }

    this.loading = true;

    try {
      if (this.isRegister) {
        // Crear cuenta en Firebase Auth
        const cred = await createUserWithEmailAndPassword(auth, this.email, this.password);

        // Guardar nombre en Auth
        await updateProfile(cred.user, { displayName: this.nombre });

        // Guardar usuario en Firestore con tu estructura
        await this.userService.crearUsuarioFirestore(
          cred.user.uid,
          this.nombre,
          this.email,
          this.password
        );

      } else {
        // Iniciar sesión
        await signInWithEmailAndPassword(auth, this.email, this.password);
      }

      this.router.navigate(['/home']);

    } catch (error: any) {
      this.errorMsg = error.message || 'Error al procesar la solicitud.';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
  
}

console.log(auth.app.name);
console.log(auth);