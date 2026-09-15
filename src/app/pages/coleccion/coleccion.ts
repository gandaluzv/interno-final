import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';
import { auth, db } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { collection, getDocs, query, where } from 'firebase/firestore';

@Component({
  selector: 'app-coleccion',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBar],
  templateUrl: './coleccion.html',
  styleUrls: ['./coleccion.css']
})
export class Coleccion {

  // Datos del usuario
  userName = '';
  userEmail = '';
  userInitial = '';
  preferencias: any = { musica: true, libros: true, peliculas: true };
  gustosActivos = 0;

  // Likes
  filtro = 'todos';
  likes: any[] = [];
  likesFiltrados: any[] = [];

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {

    // Cargar usuario
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;
        this.userInitial = this.userName.charAt(0).toUpperCase();

        // gustos activos
        this.gustosActivos =
          (perfil.preferencias.musica ? 1 : 0) +
          (perfil.preferencias.libros ? 1 : 0) +
          (perfil.preferencias.peliculas ? 1 : 0);
      }

      await this.cargarLikes();
      this.aplicarFiltro('todos');

      this.cdr.detectChanges();
    });
  }

  // ⭐ Cargar SOLO los likes del usuario actual
  async cargarLikes() {
    if (!this.userEmail) return;

    const q = query(
      collection(db, 'likes'),
      where('usuarioEmail', '==', this.userEmail)
    );

    const snap = await getDocs(q);
    this.likes = snap.docs.map(d => d.data());
  }

  aplicarFiltro(f: string) {
    this.filtro = f;

    if (f === 'todos') {
      this.likesFiltrados = this.likes;
      return;
    }

    if (f === 'recientes') {
      this.likesFiltrados = [...this.likes].sort((a, b) => b.fecha - a.fecha);
      return;
    }

    this.likesFiltrados = this.likes.filter(l => l.tipo === f);
  }

  logout() {
    auth.signOut();
  }
}
