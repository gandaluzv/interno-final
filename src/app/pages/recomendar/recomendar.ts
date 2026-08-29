import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { auth } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { ContentService, TipoContenido, Usuario } from '../../services/content.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-recomendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recomendar.html',
  styleUrls: ['./recomendar.css'],
})
export class Recomendar {

  userName = '';
  userEmail = '';
  userInitial = '';

  preferencias = {
    musica: false,
    libros: false,
    peliculas: false
  };

  tipo: TipoContenido = 'musica';
  etiquetaAutor = 'Artista / autor';
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

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;
      }

      this.userInitial = this.userName.charAt(0).toUpperCase();
      this.usuarios = this.contentService.listaUsuarios(this.userEmail);

      this.cdr.detectChanges();
    });
  }

  elegirTipo(tipo: TipoContenido) {
    this.tipo = tipo;
    this.etiquetaAutor = tipo === 'musica' ? 'Artista' : tipo === 'pelis' ? 'Director / actor principal' : 'Autor';
  }

  enviar() {
    if (!this.titulo.trim() || !this.autor.trim() || !this.genero.trim() || !this.destinatarioEmail.trim()) {
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
  }

  logout() {
    auth.signOut();
  }
}
