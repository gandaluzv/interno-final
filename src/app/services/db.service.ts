import { Injectable } from '@angular/core';
import { db } from './firebase.config';
import { collection, addDoc, getDocs, query, where, DocumentData } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  async guardarRecomendacion(data: any) {
    await addDoc(collection(db, 'recomendaciones'), data);
  }

  async obtenerRecomendacionesPorEmail(email: string): Promise<DocumentData[]> {
    const q = query(
      collection(db, 'recomendaciones'),
      where('destinatarioEmail', '==', email)
    );

    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  }
}
