import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { auth } from '../../services/firebase.config';
import { onAuthStateChanged, updateProfile, updatePassword } from 'firebase/auth';

import { UserService } from '../../services/user.service';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cuenta.html',
  styleUrls: ['./cuenta.css'],
})
export class Cuenta {

  userName = '';
  userEmail = '';
  userUID = '';
  rol = '';
  encuestaCompletada = false;

  preferencias = {
    musica: false,
    libros: false,
    peliculas: false
  };

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      this.userUID = user.uid;
      this.userEmail = user.email ?? '';

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.rol = perfil.rol;
        this.encuestaCompletada = perfil.encuestaCompletada;
        this.preferencias = perfil.preferencias;
      }

      this.cdr.detectChanges();
    });
  }

  async guardarNombre() {
    if (!this.userName.trim()) return;

    await updateProfile(auth.currentUser!, {
      displayName: this.userName
    });

    await updateDoc(doc(db, 'usuarios', this.userUID), {
      usuario: this.userName
    });

    alert('Nombre actualizado');
  }

  async guardarPreferencias() {
    await updateDoc(doc(db, 'usuarios', this.userUID), {
      preferencias: this.preferencias
    });

    alert('Preferencias actualizadas');
  }

  async cambiarPassword() {
    const nueva = prompt('Nueva contraseña:');
    if (!nueva) return;

    await updatePassword(auth.currentUser!, nueva);
    alert('Contraseña actualizada');
  }

  async eliminarCuenta() {
    const confirmar = confirm('¿Seguro que deseas eliminar tu cuenta?');
    if (!confirmar) return;

    await auth.currentUser?.delete();
    alert('Cuenta eliminada');
  }

  logout() {
    auth.signOut();
  }
}
