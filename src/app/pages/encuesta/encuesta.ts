import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.css'],
})
export class Encuesta {

  seleccion = {
    musica: false,
    libros: false,
    peliculas: false,
  };

  errorMsg = '';

  elegir(tipo: 'musica' | 'libros' | 'peliculas') {
    this.seleccion[tipo] = !this.seleccion[tipo];
    this.errorMsg = '';
  }

  continuar() {
    const alguna = this.seleccion.musica || this.seleccion.libros || this.seleccion.peliculas;

    if (!alguna) {
      this.errorMsg = 'Elige al menos una opción.';
      return;
    }

    // navegar a home
    // o guardar preferencias
  }
}
