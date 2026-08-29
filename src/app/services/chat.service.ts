import { Injectable } from '@angular/core';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

import { db } from '../services/firebase.config';

type TypingState = {
  [email: string]: boolean;
};

@Injectable({ providedIn: 'root' })
export class ChatService {

  async obtenerChatsDelUsuario(email: string) {
    const q = query(
      collection(db, "chats"),
      where("participantes", "array-contains", email)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  escucharMensajes(chatId: string, callback: Function) {
    const q = query(
      collection(db, "mensajes"),
      where("chatId", "==", chatId),
      orderBy("fecha", "asc")
    );

    return onSnapshot(q, snap => {
      const mensajes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(mensajes);
    });
  }

  async enviarMensaje(chatId: string, de: string, texto: string) {
    await addDoc(collection(db, "mensajes"), {
      chatId,
      de,
      texto,
      fecha: serverTimestamp()
    });

    await updateDoc(doc(db, "chats", chatId), {
      ultimoMensaje: texto,
      actualizado: serverTimestamp()
    });
  }

  async enviarRecomendacion(chatId: string, de: string, item: any) {
    await addDoc(collection(db, "mensajes"), {
      chatId,
      de,
      recomendacion: item,
      fecha: serverTimestamp()
    });

    await updateDoc(doc(db, "chats", chatId), {
      ultimoMensaje: `Recomendación: ${item.titulo}`,
      actualizado: serverTimestamp()
    });
  }

  // ------------------------------
  // TYPING
  // ------------------------------
  async setTyping(chatId: string, email: string, estado: boolean) {
    const ref = doc(db, "chats", chatId);

    const typingUpdate: TypingState = {
      [email]: estado
    };

    await updateDoc(ref, {
      typing: typingUpdate
    });
  }

  escucharTyping(chatId: string, callback: Function) {
    return onSnapshot(doc(db, "chats", chatId), snap => {
      callback(snap.data()?.['typing'] || {});
    });
  }
}
