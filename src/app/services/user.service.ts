import { Injectable } from '@angular/core';
import { db } from './firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UsuarioFirestore {
  usuario: string;
  email: string;
  rol: string;
  id_usuario: string;
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
      id_usuario: uid
    });
  }

  async obtenerUsuario(uid: string): Promise<UsuarioFirestore | null> {
    const ref = doc(db, 'usuarios', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data() as UsuarioFirestore;
  }
}