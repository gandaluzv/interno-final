import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { auth } from '../../services/firebase.config';
import { db } from '../../services/firebase.config';
import { doc, updateDoc } from 'firebase/firestore';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.css']
})
export class Encuesta {

  // ✔ Esto es lo que tu HTML necesita
  seleccion = {
    musica: false,
    libros: false,
    peliculas: false
  };

  errorMsg = '';

  constructor(private router: Router) {}

  // ✔ Este método lo usa tu HTML
  elegir(opcion: 'musica' | 'libros' | 'peliculas') {
    this.seleccion[opcion] = !this.seleccion[opcion];
  }

  // ✔ Este método lo usa tu HTML
  async continuar() {
    const { musica, libros, peliculas } = this.seleccion;

    if (!musica && !libros && !peliculas) {
      this.errorMsg = 'Selecciona al menos una opción.';
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      this.errorMsg = 'No hay usuario autenticado.';
      return;
    }

    const ref = doc(db, 'usuarios', user.uid);

    await updateDoc(ref, {
      encuestaCompletada: true,
      preferencias: {
        musica,
        libros,
        peliculas
      }
    });

    this.router.navigate(['/home']);
  }
}