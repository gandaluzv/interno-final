import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { auth } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-musica',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './musica.html',
  styleUrls: ['./musica.css'],
})
export class Musica {

  userName = '';
  userEmail = '';
  userInitial = '';

  preferencias = {
    musica: false,
    libros: false,
    peliculas: false
  };

  actual: any = null;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;
      }

      this.userInitial = this.userName.charAt(0).toUpperCase();

      this.cdr.detectChanges();
    });
  }

  logout() {
    auth.signOut();
  }

  siguiente() {
    this.actual = null;
  }
}