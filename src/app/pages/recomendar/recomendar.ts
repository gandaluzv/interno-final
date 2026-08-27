import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, Recomendacion, Usuario } from '../../services/content.service';

@Component({
  selector: 'app-recomendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recomendar.html',
  styleUrls: ['./recomendar.css'],
})
export class Recomendar implements OnInit {
  userName = '';
  userEmail = '';
  preferencias = { musica: true, libros: true, peliculas: true };
  userInitial = 'V';

  tipo: 'musica' | 'libros' | 'pelis' = 'musica';
  titulo = '';
  genero = '';
  autor = '';
  portada = '';
  destinatarioEmail = '';
  usuarios: Usuario[] = [];
  errorMsg = '';
  exito = false;

  constructor(private content: ContentService) {}

  ngOnInit() {
    const user = auth.currentUser;
    const email = user?.email ?? '';
    this.userEmail = email;
    this.userName = user?.displayName ?? email.split('@')[0] ?? '';
    this.userInitial = email ? email.charAt(0).toUpperCase() : 'V';
    this.usuarios = this.content.listaUsuarios(email);
  }

  logout() {
    auth.signOut();
  }

  get etiquetaAutor(): string {
    switch (this.tipo) {
      case 'musica':
        return 'Artista';
      case 'libros':
        return 'Autor';
      case 'pelis':
        return 'Director';
      default:
        return 'Autor';
    }
  }

  elegirTipo(tipo: 'musica' | 'libros' | 'pelis') {
    this.tipo = tipo;
    this.errorMsg = '';
    this.exito = false;
  }

  async enviar() {
    if (!this.titulo.trim() || !this.genero.trim() || !this.autor.trim() || !this.destinatarioEmail) {
      this.errorMsg = 'Completa todos los campos obligatorios.';
      this.exito = false;
      return;
    }

    const nuevaRecomendacion: Recomendacion = {
      tipo: this.tipo,
      titulo: this.titulo.trim(),
      autor: this.autor.trim(),
      genero: this.genero.trim(),
      portada: this.portada.trim(),
      deNombre: auth.currentUser?.displayName ?? 'Yo',
      destinatarioEmail: this.destinatarioEmail,
    };

    this.errorMsg = '';

    try {
      await this.content.enviarRecomendacion(nuevaRecomendacion);
      this.exito = true;
      this.titulo = '';
      this.genero = '';
      this.autor = '';
      this.portada = '';
      this.destinatarioEmail = '';
    } catch {
      this.exito = false;
      this.errorMsg = 'No se pudo enviar la recomendación. Inténtalo de nuevo.';
    }
  }
}
