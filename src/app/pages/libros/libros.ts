import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, Recomendacion } from '../../services/content.service';

@Component({
  selector: 'app-libros',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './libros.html',
  styleUrls: ['./libros.css'],
})
export class Libros implements OnInit {

  userInitial = 'V';
  libros: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  ngOnInit() {
    const email = auth.currentUser?.email ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.libros = this.content.recibidasPor('libros', email);
  }

  get actual(): Recomendacion | null {
    return this.libros[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;
  }
}
