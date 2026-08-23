import { Injectable } from '@angular/core';
import { db } from './firebase.config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';

export type TipoContenido = 'musica' | 'libros' | 'pelis';

export interface Usuario {
  nombre: string;
  email: string;
}

export interface Recomendacion {
  tipo: TipoContenido;
  titulo: string;
  autor: string;
  genero: string;
  portada: string;
  deNombre: string;
  destinatarioEmail: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  // Usuarios de prueba (mock)
  private usuariosMock: Usuario[] = [
    { nombre: 'Valentina Ruiz', email: 'valentina@correo.com' },
    { nombre: 'Carlos Pérez', email: 'carlos@correo.com' },
    { nombre: 'Andrea Torres', email: 'andrea@correo.com' },
  ];

  listaUsuarios(actualEmail: string): Usuario[] {
    return this.usuariosMock.filter(u => u.email !== actualEmail);
  }

  async enviarRecomendacion(data: Recomendacion) {
    await addDoc(collection(db, 'recomendaciones'), data);
  }

  async obtenerRecomendacionesPorEmail(email: string): Promise<Recomendacion[]> {
    const q = query(
      collection(db, 'recomendaciones'),
      where('destinatarioEmail', '==', email)
    );

    const snap = await getDocs(q);

    return snap.docs.map(d => d.data() as Recomendacion);
  }

  async recibidasPor(tipo: TipoContenido, email: string): Promise<Recomendacion[]> {
    const todas = await this.obtenerRecomendacionesPorEmail(email);

    return todas
      .filter(r => r.tipo === tipo)
      .map(r => ({
        tipo: r.tipo,
        titulo: r.titulo,
        autor: r.autor,
        genero: r.genero,
        portada: r.portada,
        deNombre: r.deNombre,
        destinatarioEmail: r.destinatarioEmail
      })) as Recomendacion[];
  }
}
