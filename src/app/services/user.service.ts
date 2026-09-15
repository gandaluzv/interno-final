import { Injectable } from '@angular/core';
import { db, auth } from './firebase.config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, updateEmail, updatePassword } from 'firebase/auth';

export interface UsuarioFirestore {
  usuario: string;
  email: string;
  rol: string;
  id_usuario: string;

  encuestaCompletada: boolean;

  foto?: string;
  modoOscuro?: boolean;

  preferencias: {
    musica: boolean;
    libros: boolean;
    peliculas: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  async crearUsuarioFirestore(uid: string, nombre: string, email: string) {
    const ref = doc(db, 'usuarios', uid);

    await setDoc(ref, {
      usuario: nombre,
      email: email,
      rol: 'usuario',
      id_usuario: uid,
      encuestaCompletada: false,
      foto: '',
      modoOscuro: false,
      preferencias: {
        musica: false,
        libros: false,
        peliculas: false
      }
    });
  }

  async obtenerUsuario(uid: string): Promise<UsuarioFirestore | null> {
    const ref = doc(db, 'usuarios', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data() as UsuarioFirestore;
  }

  async obtenerUsuarioActual(): Promise<UsuarioFirestore | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) return resolve(null);

        const perfil = await this.obtenerUsuario(user.uid);
        resolve(perfil);
      });
    });
  }

  async actualizarNombre(uid: string, nuevoNombre: string) {
    const ref = doc(db, 'usuarios', uid);
    await updateDoc(ref, { usuario: nuevoNombre });
  }

  async actualizarCorreo(uid: string, nuevoCorreo: string) {
    if (!auth.currentUser) return;

    await updateEmail(auth.currentUser, nuevoCorreo);

    const ref = doc(db, 'usuarios', uid);
    await updateDoc(ref, { email: nuevoCorreo });
  }

  async actualizarPassword(nuevaPass: string) {
    if (!auth.currentUser) return;
    await updatePassword(auth.currentUser, nuevaPass);
  }

  async actualizarFoto(uid: string, url: string) {
    const ref = doc(db, 'usuarios', uid);
    await updateDoc(ref, { foto: url });
  }

  async actualizarModoOscuro(uid: string, estado: boolean) {
    const ref = doc(db, 'usuarios', uid);
    await updateDoc(ref, { modoOscuro: estado });
  }
}
