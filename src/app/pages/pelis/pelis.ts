import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth, db } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { SearchBar } from '../search-bar/search-bar';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

@Component({
  selector: 'app-pelis',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBar],
  templateUrl: './pelis.html',
  styleUrls: ['./pelis.css'],
})
export class Pelis {

  userName = '';
  userEmail = '';
  userInitial = '';

  preferencias = {
    musica: false,
    libros: false,
    peliculas: false
  };

  recomendaciones: any[] = [];
  likesUsuario: any[] = [];
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

      await this.cargarLikesUsuario();
      await this.cargarRecomendaciones();
      this.filtrarRecomendaciones();

      this.cdr.detectChanges();
    });
  }

  async cargarRecomendaciones() {
    const q = query(
      collection(db, 'recomendaciones'),
      where('destinatarioEmail', '==', this.userEmail),
      where('tipo', '==', 'pelis')
    );

    const snap = await getDocs(q);
    this.recomendaciones = snap.docs.map(d => ({ ...d.data(), tipo: 'pelis' }));

    this.actual = this.recomendaciones[0] || null;
  }

  async cargarLikesUsuario() {
    const q = query(
      collection(db, 'likes'),
      where('usuarioEmail', '==', this.userEmail)
    );

    const snap = await getDocs(q);
    this.likesUsuario = snap.docs.map(d => d.data());
  }

  filtrarRecomendaciones() {
    this.recomendaciones = this.recomendaciones.filter(rec => {
      return !this.likesUsuario.some(like =>
        like.titulo === rec.titulo && like.tipo === rec.tipo
      );
    });

    this.actual = this.recomendaciones[0] || null;
  }

  async darLike(item: any) {
    const quien = item?.quien || item?.autor || item?.artista || item?.director || 'Autor desconocido';
    const data = {
      usuarioEmail: this.userEmail || 'usuario desconocido',
      tipo: item?.tipo || 'desconocido',
      titulo: item?.titulo || 'Sin título',
      quien,
      descripcion: item?.descripcion || 'Sin descripción disponible',
      fondo: item?.fondo || '#e5e5e5',
      icono: item?.icono || '⭐',
      fecha: Date.now()
    };

    await setDoc(doc(collection(db, 'likes')), data);
  }

  siguiente() {
    this.recomendaciones.shift();
    this.actual = this.recomendaciones[0] || null;
  }

  logout() {
    auth.signOut();
  }
}