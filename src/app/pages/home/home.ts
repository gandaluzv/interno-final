import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';
import { auth, db } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { collection, query, where, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {

  userName = '';
  userEmail = '';
  userInitial = '';

  preferencias = { musica: false, libros: false, peliculas: false };

  // ⭐ Métrica de comunidad
  metricComunidad = '0 amigos';

  // ⭐ Nueva métrica: gustos activos
  gustosActivos = 0;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      this.userEmail = user.email ?? '';

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;

        // ⭐ Cálculo dinámico de gustos activos
        this.gustosActivos = [
          this.preferencias.musica === true,
          this.preferencias.libros === true,
          this.preferencias.peliculas === true
        ].filter(v => v).length;

      } else {
        this.userName = user.displayName ?? this.userEmail.split('@')[0];
      }

      this.userInitial = this.userName.charAt(0).toUpperCase();

      // ⭐ Contar amigos
      await this.contarAmigos(user.uid);

      // ⭐ Refrescar vista
      this.cdr.detectChanges();
    });
  }

  // ⭐ Función para contar amigos
  async contarAmigos(miUid: string) {

    // Amigos donde yo soy "de"
    const q1 = query(
      collection(db, 'amigos'),
      where('de', '==', miUid)
    );
    const snap1 = await getDocs(q1);

    // Amigos donde yo soy "a"
    const q2 = query(
      collection(db, 'amigos'),
      where('a', '==', miUid)
    );
    const snap2 = await getDocs(q2);

    const total = snap1.size + snap2.size;

    this.metricComunidad = `${total} amigos`;
    this.cdr.detectChanges();
  }

  logout() {
    auth.signOut();
  }
}