import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, Recomendacion } from '../../services/content.service';

@Component({
  selector: 'app-pelis',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pelis.html',
  styleUrls: ['./pelis.css'],
})
export class Pelis implements OnInit {

  userInitial = 'V';
  pelis: Recomendacion[] = [];
  indice = 0;

  constructor(private content: ContentService) {}

  ngOnInit() {
    const email = auth.currentUser?.email ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.pelis = this.content.recibidasPor('pelis', email);
  }

  get actual(): Recomendacion | null {
    return this.pelis[this.indice] ?? null;
  }

  siguiente() {
    this.indice++;
  }
}
