import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { db } from '../../services/firebase.config';
import { collection, getDocs } from "firebase/firestore";

 
@Component({
  selector: 'app-prueba',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prueba.html',
  styleUrl: './prueba.css',
})

export class Prueba {

  async cargarUsuarios() {
    const col = collection(db, "usuarios");
    return await getDocs(col);
  }
  
async ngOnInit() {
  const r = await this.cargarUsuarios();

  r.docs.forEach(doc => {
    const data = doc.data();
    console.log("Usuario encontrado:", data['usuario']);
  });
}
}



