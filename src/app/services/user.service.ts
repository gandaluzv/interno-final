import { Injectable } from '@angular/core';
import { db } from './firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UsuarioFirestore {
  usuario: string;
  email: string;
  contraseña: string;
  rol: string;
  id_usuario: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Crear usuario en Firestore con tu estructura real
  async crearUsuarioFirestore(uid: string, nombre: string, email: string, password: string) {
    const ref = doc(db, 'usuarios', uid);

    await setDoc(ref, {
      usuario: nombre,
      email: email,
      contraseña: password,
      rol: 'usuario',
      id_usuario: uid
    });
  }

  // Obtener usuario desde Firestore
  async obtenerUsuario(uid: string): Promise<UsuarioFirestore | null> {
    const ref = doc(db, 'usuarios', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;
    return snap.data() as UsuarioFirestore;
  }
}
