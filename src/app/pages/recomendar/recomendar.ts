import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, Usuario } from '../../services/content.service';

@Component({
  selector: 'app-recomendar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recomendar.html',
  styleUrls: ['./recomendar.css'],
})
export class Recomendar implements OnInit {

  userInitial = 'V';

  tipo: 'musica' | 'libros' | 'pelis' = 'musica';
  titulo = '';
  genero = '';
  autor = '';
  portada = '';
  destinatarioEmail = '';

  etiquetaAutor = 'Artista';
  errorMsg = '';
  exito = false;

  usuarios: Usuario[] = [];

  constructor(private content: ContentService) {}

  ngOnInit() {
    const email = auth.currentUser?.email ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.usuarios = this.content.listaUsuarios(email);
    this.actualizarEtiquetaAutor();
  }

  elegirTipo(tipo: 'musica' | 'libros' | 'pelis') {
    this.tipo = tipo;
    this.actualizarEtiquetaAutor();
  }

  actualizarEtiquetaAutor() {
    if (this.tipo === 'musica') this.etiquetaAutor = 'Artista';
    else if (this.tipo === 'libros') this.etiquetaAutor = 'Autor';
    else this.etiquetaAutor = 'Director';
  }

  enviar() {
  this.errorMsg = '';
  this.exito = false;

  if (!this.titulo || !this.genero || !this.autor || !this.destinatarioEmail) {
    this.errorMsg = 'Completa todos los campos obligatorios.';
    return;
  }

  const user = auth.currentUser;
  const deNombre = user?.displayName || (user?.email?.split('@')[0] ?? 'Alguien');

  this.content.enviarRecomendacion({
    tipo: this.tipo,
    titulo: this.titulo,
    genero: this.genero,
    autor: this.autor,
    portada: this.portada,
    destinatarioEmail: this.destinatarioEmail,
    deNombre: deNombre   // ← ESTA ES LA CLAVE
  });

  this.exito = true;
  this.titulo = '';
  this.genero = '';
  this.autor = '';
  this.portada = '';
  this.destinatarioEmail = '';
}

}
