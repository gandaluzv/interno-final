import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { db } from '../../services/firebase.config';
import { collection, getDocs } from 'firebase/firestore';
import { Usuario } from '../../models/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBar {

  constructor(private router: Router) {}

  searchQuery = '';
  resultadosPersonas: Usuario[] = [];

  async buscar() {
    console.log("Buscando:", this.searchQuery);

    const q = this.searchQuery.toLowerCase().trim();

    if (!q) {
      this.resultadosPersonas = [];
      return;
    }

    const ref = collection(db, 'usuarios');
    const snap = await getDocs(ref);

    console.log("Documentos encontrados:", snap.size);

    const usuarios: Usuario[] = snap.docs.map(doc => {
    const data = doc.data() as Usuario; return { ...data, uid: doc.id };   // 🔥 Aquí añadimos el UID
    });

    console.log("Usuarios cargados:", usuarios);

    // 🔥 FILTRO SEGURO (evita el error toLowerCase)
    this.resultadosPersonas = usuarios.filter(u =>
      (u.nombre?.toLowerCase().includes(q)) ||
      (u.email?.toLowerCase().includes(q))
    );

    console.log("Resultados filtrados:", this.resultadosPersonas);
  }

  abrirPersona(p: Usuario) {
    this.router.navigate(['/perfil', p.uid]);
  }
}
