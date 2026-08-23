import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth as firebaseAuth } from '../../services/firebase.config';
import { ContentService, Recomendacion } from '../../services/content.service';

@Component({
  selector: 'app-pelis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pelis.html',
  styleUrl: './pelis.css',
})
export class Pelis implements OnInit {
  userInitial = 'V';

  peliculas: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  async ngOnInit() {
    const email = firebaseAuth.currentUser?.email ?? '';
    this.userInitial = email ? email.charAt(0).toUpperCase() : 'V';
    this.peliculas = await this.content.recibidasPor('pelis', email);
  }

  get actual(): Recomendacion | null {
    return this.peliculas[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;
    if (this.indice >= this.peliculas.length) {
      this.indice = 0;
    }
  }
}
