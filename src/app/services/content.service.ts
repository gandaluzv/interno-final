import { Injectable } from '@angular/core';

export interface Recomendacion {
  tipo: 'musica' | 'libros' | 'pelis';
  titulo: string;
  autor: string;
  genero: string;
  portada: string;
  deNombre: string;
  destinatarioEmail: string;
}

export interface Usuario {
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private recomendaciones: Recomendacion[] = [];

  private usuariosMock: Usuario[] = [
    { nombre: 'Valentina Ruiz', email: 'valentina@correo.com' },
    { nombre: 'Carlos Pérez', email: 'carlos@correo.com' },
    { nombre: 'Andrea Torres', email: 'andrea@correo.com' },
  ];

  listaUsuarios(actualEmail: string): Usuario[] {
    return this.usuariosMock.filter(u => u.email !== actualEmail);
  }

  enviarRecomendacion(data: Recomendacion) {
    this.recomendaciones.push(data);
  }

  recibidasPor(tipo: string, email: string): Recomendacion[] {
    return this.recomendaciones.filter(r => r.tipo === tipo && r.destinatarioEmail === email);
  }
}
