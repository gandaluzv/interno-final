import { Injectable } from '@angular/core';
import { DbService } from './db.service';

export type TipoContenido = 'musica' | 'libros' | 'pelis';

export interface Recomendacion {
  tipo: TipoContenido;
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

  constructor(private db: DbService) {}

  private usuariosMock: Usuario[] = [
    { nombre: 'Valentina Ruiz', email: 'valentina@correo.com' },
    { nombre: 'Carlos Pérez', email: 'carlos@correo.com' },
    { nombre: 'Andrea Torres', email: 'andrea@correo.com' },
  ];

  listaUsuarios(actualEmail: string): Usuario[] {
    return this.usuariosMock.filter(u => u.email !== actualEmail);
  }

  async enviarRecomendacion(data: Recomendacion) {
    await this.db.guardarRecomendacion(data);
  }

  async recibidasPor(tipo: TipoContenido, email: string) {
    const todas = await this.db.obtenerRecomendacionesPorEmail(email);
    return todas.filter(r => r['tipo'] === tipo);
  }
}