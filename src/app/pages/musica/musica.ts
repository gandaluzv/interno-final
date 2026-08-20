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

  userInitial = 'V';
  canciones: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  ngOnInit() {
    const email = auth.currentUser?.email ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.canciones = this.content.recibidasPor('musica', email);
  }

  get actual(): Recomendacion | null {
    return this.canciones[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;
  }
}
