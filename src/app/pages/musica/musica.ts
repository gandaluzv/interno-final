import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, Recomendacion } from '../../services/content.service';

@Component({
  selector: 'app-musica',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './musica.html',
  styleUrls: ['./musica.css'],
})
export class Musica implements OnInit {

  userName = '';
  userEmail = '';
  preferencias = { musica: true, libros: true, peliculas: true };
  userInitial = 'V';
  canciones: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  async ngOnInit() {
    const user = auth.currentUser;
    const email = user?.email ?? '';
    this.userEmail = email;
    this.userName = user?.displayName ?? email.split('@')[0] ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.canciones = await this.content.recibidasPor('musica', email);
  }

  logout() {
    auth.signOut();
  }

  get actual(): Recomendacion | null {
    return this.canciones[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;
    if (this.indice >= this.canciones.length) {
      this.indice = 0;
    }
  }
}
