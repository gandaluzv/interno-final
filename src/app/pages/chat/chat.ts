import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { auth, db } from '../../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';
import { SearchBar } from '../search-bar/search-bar';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SearchBar],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat {

  userName = '';
  userEmail = '';
  userInitial = '';
  uid = '';

  preferencias = { musica: true, libros: true, peliculas: true };

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

  // ⭐ Modal moderno
  mostrarCrearChat = false;
  modoChat: 'individual' | 'grupo' = 'individual';
  nombreGrupo = '';
  seleccionados: any[] = [];

  // ⭐ Amigos reales
  amigos: string[] = [];
  amigosData: any[] = [];

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

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      this.uid = user.uid;

      const perfil = await this.userService.obtenerUsuario(user.uid);

      if (perfil) {
        this.userName = perfil.usuario;
        this.userEmail = perfil.email;
        this.preferencias = perfil.preferencias;
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }

      this.chats = await this.chatService.obtenerChatsDelUsuario(this.userEmail);

      await this.cargarAmigos();

      this.cdr.detectChanges();
    });
  }

  // ⭐ Cargar amigos reales
  async cargarAmigos() {
    if (!this.uid) return;

    const lista: string[] = [];

    const q1 = query(collection(db, 'amigos'), where('de', '==', this.uid));
    const s1 = await getDocs(q1);
    s1.forEach(d => lista.push(d.data()['a']));

    const q2 = query(collection(db, 'amigos'), where('a', '==', this.uid));
    const s2 = await getDocs(q2);
    s2.forEach(d => lista.push(d.data()['de']));

    this.amigos = lista;

    // ⭐ Convertir UID → datos reales
    this.amigosData = [];
    const usuariosSnap = await getDocs(collection(db, 'usuarios'));

    usuariosSnap.forEach(d => {
      const u = d.data();
      if (this.amigos.includes(u['id_usuario'])) {
        this.amigosData.push(u);
      }
    });

    this.cdr.detectChanges();
  }

  // ⭐ Obtener inicial del usuario
  obtenerInicial(u: any) {
    if (u.usuario && u.usuario.trim().length > 0) {
      return u.usuario.trim().charAt(0).toUpperCase();
    }

    if (u.nombre && u.nombre.trim().length > 0) {
      return u.nombre.trim().charAt(0).toUpperCase();
    }

    return u.email.trim().charAt(0).toUpperCase();
  }

  // ⭐ Abrir modal moderno
  abrirCrearChat() {
    this.mostrarCrearChat = true;
  }

  cerrarCrearChat() {
    this.mostrarCrearChat = false;
    this.modoChat = 'individual';
    this.nombreGrupo = '';
    this.seleccionados = [];
  }

  estaDentro(u: any) {
    return this.seleccionados.some(x => x.email === u.email);
  }

  toggleSeleccion(u: any) {
    if (this.estaDentro(u)) {
      this.seleccionados = this.seleccionados.filter(x => x.email !== u.email);
    } else {
      this.seleccionados.push(u);
    }
  }

  async crearChatDesdeModal() {

    // ⭐ Individual
    if (this.modoChat === 'individual') {
      if (this.seleccionados.length !== 1) return alert("Selecciona 1 persona");

      const amigo = this.seleccionados[0];
      const id = `${this.userEmail}_${amigo.email}`;

      await setDoc(doc(db, 'chats', id), {
        id,
        nombre: `${this.userName} y ${amigo.usuario}`,
        participantes: [this.userEmail, amigo.email],
        esGrupo: false,
        color: '#6a00ff',
        ultimoMensaje: ''
      });

      this.chats = await this.chatService.obtenerChatsDelUsuario(this.userEmail);
      this.cerrarCrearChat();
      return;
    }

    // ⭐ Grupo
    if (this.modoChat === 'grupo') {
      if (!this.nombreGrupo.trim()) return alert("Pon un nombre al grupo");
      if (this.seleccionados.length < 2) return alert("Selecciona mínimo 2 personas");

      const participantes = [
        this.userEmail,
        ...this.seleccionados.map(u => u.email)
      ];

      const id = `grupo_${Date.now()}`;

      await setDoc(doc(db, 'chats', id), {
        id,
        nombre: this.nombreGrupo.trim(),
        participantes,
        esGrupo: true,
        color: '#ff0066',
        ultimoMensaje: ''
      });

      this.chats = await this.chatService.obtenerChatsDelUsuario(this.userEmail);
      this.cerrarCrearChat();
    }
  }

  abrirChat(id: string) {
    this.chatActivoId = id;
    this.chatActivo = this.chats.find(c => c.id === id);

    if (this.unsubscribeMensajes) this.unsubscribeMensajes();
    if (this.unsubscribeTyping) this.unsubscribeTyping();

    this.unsubscribeMensajes = this.chatService.escucharMensajes(id, (msgs: any[]) => {
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
