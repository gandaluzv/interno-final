import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { auth, db } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { ContentService, TipoContenido, Usuario } from '../../services/content.service';
import { UserService } from '../../services/user.service';
import { SearchBar } from '../search-bar/search-bar';
import { collection, getDocs, query, where } from 'firebase/firestore';

@Component({
  selector: 'app-recomendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchBar],
  templateUrl: './recomendar.html',
  styleUrls: ['./recomendar.css'],
})
export class Recomendar {

  userName = '';
  userEmail = '';
  userInitial = '';
  userUid = '';

  preferencias = { musica: false, libros: false, peliculas: false };

  tipo: TipoContenido = 'musica';
  etiquetaAutor = 'Artista';
  placeholderTitulo = 'Ej. Midnights';
  placeholderAutor = 'Ej. Taylor Swift';
  placeholderGenero = 'Ej. Pop';

  titulo = '';
  autor = '';
  genero = '';
  portada = '';
  destinatarioEmail = '';

  usuarios: Usuario[] = [];
  errorMsg = '';
  exito = false;

  constructor(
    private userService: UserService,
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      this.userUid = user.uid;
      this.userEmail = user.email!;

      const perfil = await this.userService.obtenerUsuario(user.uid);
      if (perfil) {
        this.userName = perfil.usuario;
        this.preferencias = perfil.preferencias;
      }

      this.userInitial = this.userName.charAt(0).toUpperCase();

      await this.cargarSoloAmigos();

      this.cdr.detectChanges();
    });
  }

  async cargarSoloAmigos() {
    const listaUID: string[] = [];

    const q1 = query(collection(db, 'amigos'), where('de', '==', this.userUid));
    const s1 = await getDocs(q1);
    s1.forEach(d => listaUID.push(d.data()['a']));

    const q2 = query(collection(db, 'amigos'), where('a', '==', this.userUid));
    const s2 = await getDocs(q2);
    s2.forEach(d => listaUID.push(d.data()['de']));

    const usuariosSnap = await getDocs(collection(db, 'usuarios'));

    this.usuarios = usuariosSnap.docs
      .map(d => d.data() as Usuario)
      .filter(u => listaUID.includes(u['id_usuario']));
  }

  elegirTipo(tipo: TipoContenido) {
    this.tipo = tipo;

    // ⭐ Autor / artista / director
    this.etiquetaAutor =
      tipo === 'musica'
        ? 'Artista'
        : tipo === 'pelis'
        ? 'Director / actor principal'
        : 'Autor';

    // ⭐ Placeholder del título
    this.placeholderTitulo =
      tipo === 'musica'
        ? 'Ej. Midnights'
        : tipo === 'libros'
        ? 'Ej. El Hobbit'
        : 'Ej. Interstellar';

    // ⭐ Placeholder del autor / director / artista
    this.placeholderAutor =
      tipo === 'musica'
        ? 'Ej. Taylor Swift'
        : tipo === 'libros'
        ? 'Ej. J.R.R. Tolkien'
        : 'Ej. Christopher Nolan';

    // ⭐ Placeholder del género
    this.placeholderGenero =
      tipo === 'musica'
        ? 'Ej. Pop'
        : tipo === 'libros'
        ? 'Ej. Fantasía'
        : 'Ej. Ciencia ficción';
  }

  enviar() {
    if (
      !this.titulo.trim() ||
      !this.autor.trim() ||
      !this.genero.trim() ||
      !this.destinatarioEmail.trim()
    ) {
      this.errorMsg = 'Completa todos los campos obligatorios y elige un destinatario.';
      this.exito = false;
      return;
    }

    this.errorMsg = '';

    this.contentService.enviarRecomendacion({
      tipo: this.tipo,
      titulo: this.titulo.trim(),
      autor: this.autor.trim(),
      genero: this.genero.trim(),
      portada: this.portada.trim(),
      deNombre: this.userName || 'Usuario',
      destinatarioEmail: this.destinatarioEmail,
    });

    this.exito = true;

    this.titulo = '';
    this.autor = '';
    this.genero = '';
    this.portada = '';
    this.destinatarioEmail = '';

    // ⭐ Reset placeholders
    this.elegirTipo(this.tipo);
  }

  logout() {
    auth.signOut();
  }
}
