import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { auth } from '../../services/firebase.config';
import { UserService, UsuarioFirestore } from '../../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {

  userName = '';
  userEmail = '';
  userInitial = '';

  constructor(private userService: UserService) {}

  async ngOnInit() {
    const user = auth.currentUser;
    if (!user) return;

    this.userEmail = user.email ?? '';

    // Obtener datos reales desde Firestore
    const perfil = await this.userService.obtenerUsuario(user.uid);

    if (perfil) {
      this.userName = perfil.usuario;
      this.userEmail = perfil.email;
    } else {
      // fallback si Firestore no tiene datos
      this.userName = user.displayName ?? this.userEmail.split('@')[0];
    }

    this.userInitial = this.userName.charAt(0).toUpperCase();
  }

  logout() {
    auth.signOut();
  }
}
