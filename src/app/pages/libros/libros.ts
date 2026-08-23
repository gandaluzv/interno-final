import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth as firebaseAuth } from '../../services/firebase.config';
import { ContentService, Recomendacion } from '../../services/content.service';

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './libros.html',
  styleUrl: './libros.css',
})
export class Libros implements OnInit {
  userInitial = 'V';

  libros: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  async ngOnInit() {
    const email = firebaseAuth.currentUser?.email ?? '';
    this.userInitial = email ? email.charAt(0).toUpperCase() : 'V';
    this.libros = await this.content.recibidasPor('libros', email);
  }

  get actual(): Recomendacion | null {
    return this.libros[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;

    // Si llega al final, reinicia
    if (this.indice >= this.libros.length) {
      this.indice = 0;
    }
  }
}
