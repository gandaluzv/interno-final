import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { auth } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat {

  userName = '';
  userEmail = '';
  userInitial = '';
  preferencias = {
    musica: true,
    libros: true,
    peliculas: true
  };

  chats: any[] = [];
  chatActivoId: string | null = null;
  chatActivo: any = null;

  mensajes: any[] = [];
  unsubscribeMensajes: any = null;
  unsubscribeTyping: any = null;

  nuevoMensaje = '';
  typingDelOtro = false;
  typingTimeout: any = null;

  mostrarSelector = false;
  categoriaSelector = 'musica';

  etiquetaTipo: any = {
    musica: 'Canción',
    libros: 'Libro',
    pelis: 'Película'
  };

  catalogo: any = {
    musica: [
      { titulo: 'Midnights', quien: 'Taylor Swift', fondo: '#cce5ff', icono: '🎵', tipo: 'musica' },
      { titulo: 'Random Access Memories', quien: 'Daft Punk', fondo: '#ffe5cc', icono: '🎧', tipo: 'musica' }
    ],
    libros: [
      { titulo: 'El Hobbit', quien: 'Tolkien', fondo: '#e5ffd1', icono: '📘', tipo: 'libros' },
      { titulo: '1984', quien: 'George Orwell', fondo: '#ffd1d1', icono: '📕', tipo: 'libros' }
    ],
    pelis: [
      { titulo: 'Interstellar', quien: 'Christopher Nolan', fondo: '#d1e0ff', icono: '🎬', tipo: 'pelis' },
      { titulo: 'Dune', quien: 'Denis Villeneuve', fondo: '#ffe6cc', icono: '🎞️', tipo: 'pelis' }
    ]
  };

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {

    if (typeof Notification !== 'undefined') {
      Notification.requestPermission();
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }

      this.chats = await this.chatService.obtenerChatsDelUsuario(this.userEmail);
      this.cdr.detectChanges();
    });
  }

  abrirChat(id: string) {
    this.chatActivoId = id;
    this.chatActivo = this.chats.find(c => c.id === id);

    if (this.unsubscribeMensajes) this.unsubscribeMensajes();
    if (this.unsubscribeTyping) this.unsubscribeTyping();

    this.unsubscribeMensajes = this.chatService.escucharMensajes(id, (msgs: any[]) => {

      const ultimo = msgs[msgs.length - 1];
      if (ultimo && ultimo.de !== this.userEmail && typeof Notification !== 'undefined') {
        new Notification("Nuevo mensaje", {
          body: ultimo.texto || "Nueva recomendación",
        });
      }

      this.mensajes = msgs;
      this.chatActivo.mensajes = msgs;
      this.cdr.detectChanges();
      this.scrollAbajo();
    });

    this.unsubscribeTyping = this.chatService.escucharTyping(id, (typing: any) => {
      const otro = this.chatActivo.participantes.find((p: string) => p !== this.userEmail);
      this.typingDelOtro = typing?.[otro] || false;
      this.cdr.detectChanges();
    });
  }

  volverALaLista() {
    this.chatActivoId = null;
    this.chatActivo = null;
    if (this.unsubscribeMensajes) this.unsubscribeMensajes();
    if (this.unsubscribeTyping) this.unsubscribeTyping();
  }

  ultimoMensaje(chat: any) {
    return chat.ultimoMensaje || '';
  }

  scrollAbajo() {
    setTimeout(() => {
      const contenedor = document.querySelector('.conv-msgs');
      if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;
    }, 50);
  }

  typing() {
    this.chatService.setTyping(this.chatActivoId!, this.userEmail, true);

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.chatService.setTyping(this.chatActivoId!, this.userEmail, false);
    }, 1500);
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    this.chatService.enviarMensaje(
      this.chatActivoId!,
      this.userEmail,
      this.nuevoMensaje
    );

    this.chatService.setTyping(this.chatActivoId!, this.userEmail, false);
    this.nuevoMensaje = '';
  }

  toggleSelector() {
    this.mostrarSelector = !this.mostrarSelector;
  }

  elegirCategoria(cat: string) {
    this.categoriaSelector = cat;
  }

  enviarRecomendacion(item: any) {
    this.chatService.enviarRecomendacion(
      this.chatActivoId!,
      this.userEmail,
      item
    );

    this.mostrarSelector = false;
  }

  logout() {
    auth.signOut();
  }
}
