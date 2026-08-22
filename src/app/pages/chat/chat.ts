import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { auth } from '../../services/firebase.config';
import { ContentService, TipoContenido, Usuario } from '../../services/content.service';

interface ItemCatalogo {
  icono: string;
  fondo: string;
  titulo: string;
  quien: string;
}

interface Mensaje {
  de: 'yo' | string;
  texto?: string;
  recomendacion?: ItemCatalogo & { tipo: TipoContenido };
}

interface ChatData {
  id: string;
  nombre: string;
  esGrupo: boolean;
  color: string;
  mensajes: Mensaje[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
})
export class Chat implements OnInit {

  userInitial = 'V';
  userNombre = '';

  catalogo: Record<TipoContenido, ItemCatalogo[]> = {
    musica: [
      { icono: '🎵', fondo: 'linear-gradient(135deg,#7E22CE,#DC2626)', titulo: 'Midnights', quien: 'Taylor Swift' },
      { icono: '🎵', fondo: 'linear-gradient(135deg,#2563EB,#7E22CE)', titulo: 'Viva La Vida', quien: 'Coldplay' },
      { icono: '🎵', fondo: 'linear-gradient(135deg,#DC2626,#7E22CE)', titulo: 'Starboy', quien: 'The Weeknd' },
    ],
    libros: [
      { icono: '📖', fondo: 'linear-gradient(135deg,#2563EB,#7E22CE)', titulo: 'El nombre del viento', quien: 'Patrick Rothfuss' },
      { icono: '📖', fondo: 'linear-gradient(135deg,#7E22CE,#DC2626)', titulo: 'Sapiens', quien: 'Yuval Noah Harari' },
      { icono: '📖', fondo: 'linear-gradient(135deg,#DC2626,#2563EB)', titulo: 'Cosmos', quien: 'Carl Sagan' },
    ],
    pelis: [
      { icono: '🎬', fondo: 'linear-gradient(135deg,#DC2626,#7E22CE)', titulo: 'Dune: Parte Dos', quien: 'Denis Villeneuve' },
      { icono: '🎬', fondo: 'linear-gradient(135deg,#2563EB,#DC2626)', titulo: 'Interstellar', quien: 'Christopher Nolan' },
      { icono: '🎬', fondo: 'linear-gradient(135deg,#7E22CE,#2563EB)', titulo: 'Coco', quien: 'Lee Unkrich' },
    ],
  };

  etiquetaTipo: Record<TipoContenido, string> = {
    musica: 'Música',
    libros: 'Libros',
    pelis: 'Películas',
  };

  chats: ChatData[] = [
    {
      id: 'c1',
      nombre: 'Marco Vidal',
      esGrupo: false,
      color: 'linear-gradient(135deg,#7E22CE,#DC2626)',
      mensajes: [
        { de: 'Marco Vidal', texto: '¿Ya viste Dune: Parte Dos?' },
        { de: 'yo', texto: 'Sí! Me encantó la fotografía' },
        { de: 'Marco Vidal', texto: 'Igual, deberíamos ir por la siguiente juntos' },
      ],
    },
    {
      id: 'c2',
      nombre: 'Elena Ríos',
      esGrupo: false,
      color: 'linear-gradient(135deg,#2563EB,#7E22CE)',
      mensajes: [
        { de: 'Elena Ríos', texto: 'Te presto el libro de Rothfuss cuando quieras' },
        { de: 'yo', texto: 'Dale, gracias!' },
      ],
    },
    {
      id: 'c3',
      nombre: 'Club de lectura',
      esGrupo: true,
      color: 'linear-gradient(135deg,#DC2626,#7E22CE)',
      mensajes: [
        { de: 'Elena Ríos', texto: '¿Leemos Sapiens este mes?' },
        { de: 'Marco Vidal', texto: 'Por mí bien' },
      ],
    },
  ];

  chatActivoId: string | null = null;
  nuevoMensaje = '';
  mostrarSelector = false;
  categoriaSelector: TipoContenido = 'musica';

  constructor(private content: ContentService) {}

  ngOnInit() {
    const email = auth.currentUser?.email ?? '';
    this.userInitial = email.charAt(0).toUpperCase() || 'V';
    this.userNombre = email.split('@')[0];
  }

  get chatActivo(): ChatData | undefined {
    return this.chats.find(c => c.id === this.chatActivoId);
  }

  abrirChat(id: string) {
    this.chatActivoId = id;
    this.mostrarSelector = false;
  }

  volverALaLista() {
    this.chatActivoId = null;
  }

  ultimoMensaje(chat: ChatData): string {
    const m = chat.mensajes.at(-1);
    if (!m) return 'Sin mensajes aún';

    const prefijo =
      m.de === 'yo'
        ? 'Tú: '
        : chat.esGrupo
          ? `${m.de}: `
          : '';

    const contenido = m.recomendacion
      ? `🎁 Recomendación: ${m.recomendacion.titulo}`
      : m.texto;

    return prefijo + contenido;
  }

  enviarMensaje() {
    const texto = this.nuevoMensaje.trim();
    if (!texto || !this.chatActivo) return;

    this.chatActivo.mensajes.push({ de: 'yo', texto });
    this.nuevoMensaje = '';

    if (!this.chatActivo.esGrupo) {
      setTimeout(() => {
        this.chatActivo?.mensajes.push({
          de: this.chatActivo!.nombre,
          texto: '¡Genial, hablamos pronto! 🙌',
        });
      }, 900);
    }
  }

  toggleSelector() {
    this.mostrarSelector = !this.mostrarSelector;
  }

  elegirCategoria(cat: TipoContenido) {
    this.categoriaSelector = cat;
  }

  enviarRecomendacion(item: ItemCatalogo) {
    if (!this.chatActivo) return;

    const chat = this.chatActivo;

    chat.mensajes.push({
      de: 'yo',
      recomendacion: { ...item, tipo: this.categoriaSelector },
    });

    const destinatario = this.content
      .listaUsuarios(auth.currentUser?.email ?? '')
      .find((u: Usuario) => u.nombre === chat.nombre);

    if (destinatario) {
      this.content.enviarRecomendacion({
        tipo: this.categoriaSelector,
        titulo: item.titulo,
        genero: '—',
        portada: '',
        autor: item.quien,
        deNombre: this.userNombre,
        destinatarioEmail: destinatario.email, // ✔ propiedad correcta
      });
    }

    this.mostrarSelector = false;
  }
}