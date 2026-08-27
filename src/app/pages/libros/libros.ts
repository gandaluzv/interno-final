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
  userName = '';
  userEmail = '';
  preferencias = { musica: true, libros: true, peliculas: true };
  userInitial = 'V';

  libros: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  async ngOnInit() {
    const user = firebaseAuth.currentUser;
    const email = user?.email ?? '';
    this.userEmail = email;
    this.userName = user?.displayName ?? email.split('@')[0] ?? '';
    this.userInitial = email ? email.charAt(0).toUpperCase() : 'V';
    this.libros = await this.content.recibidasPor('libros', email);
  }

  logout() {
    firebaseAuth.signOut();
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
