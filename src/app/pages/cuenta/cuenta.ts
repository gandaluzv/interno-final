import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { auth, db } from '../../services/firebase.config';
import { SearchBar } from '../search-bar/search-bar';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SearchBar],
  templateUrl: './cuenta.html',
  styleUrls: ['./cuenta.css'],
})
export class Cuenta implements OnInit {

  // Datos del usuario en sesión
  userName = '';
  userEmail = '';
  foto = '';
  modoOscuro = false;
  uid = '';

  // Sidebar
  userInitial = '';
  preferencias = { musica: false, libros: false, peliculas: false };

  // Inputs
  nuevoNombre = '';
  nuevoCorreo = '';
  nuevaPass = '';
  nuevaFoto = '';

  // Solicitudes
  solicitudesPendientes: any[] = [];

  // ⭐ Lista de amigos
  amigos: any[] = [];

  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {

    // Cargar usuario
    const user = await this.userService.obtenerUsuarioActual();
    if (user) {
      this.userName = user.usuario;
      this.userEmail = user.email;
      this.foto = user.foto || '';
      this.modoOscuro = user.modoOscuro || false;
      this.uid = user.id_usuario;
      this.userInitial = user.usuario.charAt(0).toUpperCase();
      this.preferencias = user.preferencias;

      document.body.classList.toggle('dark-mode', this.modoOscuro);
      this.cdr.detectChanges();
    }

    // Solicitudes
    await this.cargarSolicitudes();

    // ⭐ Amigos
    await this.cargarAmigos();
  }

  // ⭐ Cargar amigos reales
  async cargarAmigos() {
    if (!this.uid) return;

    const lista: any[] = [];

    // Yo envié amistad
    const q1 = query(collection(db, 'amigos'), where('de', '==', this.uid));
    const s1 = await getDocs(q1);
    s1.forEach(d => lista.push(d.data()['a']));

    // Me enviaron amistad
    const q2 = query(collection(db, 'amigos'), where('a', '==', this.uid));
    const s2 = await getDocs(q2);
    s2.forEach(d => lista.push(d.data()['de']));

    // Obtener nombre y email del amigo
    this.amigos = [];
    for (const amigoUid of lista) {
      const ref = doc(db, 'usuarios', amigoUid);
      const snap = await getDoc(ref);
      const data = snap.data() as any;

      this.amigos.push({
        uid: amigoUid,
        nombre: data?.usuario ?? 'Usuario',
        email: data?.email ?? '',
        foto: data?.foto ?? ''
      });
    }

    this.cdr.detectChanges();
  }

  // ⭐ Cargar solicitudes pendientes
  async cargarSolicitudes() {
    if (!this.uid) return;

    const q = query(
      collection(db, 'solicitudes'),
      where('a', '==', this.uid),
      where('estado', '==', 'pendiente')
    );

    const snap = await getDocs(q);
    const solicitudes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

    this.solicitudesPendientes = [];

    for (const sol of solicitudes) {
      const refUser = doc(db, 'usuarios', sol.de);
      const snapUser = await getDoc(refUser);
      const dataUser = snapUser.data() as any;

      this.solicitudesPendientes.push({
        ...sol,
        nombreUsuario: dataUser?.['usuario'] ?? 'Usuario desconocido',
        emailUsuario: dataUser?.['email'] ?? ''
      });
    }

    this.cdr.detectChanges();
  }

  // ⭐ Aceptar solicitud
  async aceptarSolicitud(sol: any) {
    const { de, a } = sol;

    await setDoc(doc(db, 'amigos', `${de}_${a}`), {
      de,
      a,
      fecha: Date.now()
    });

    await updateDoc(doc(db, 'solicitudes', sol.id), {
      estado: 'aceptada'
    });

    alert('Solicitud aceptada');

    await this.cargarSolicitudes();
    await this.cargarAmigos();
  }

  // ⭐ Rechazar solicitud
  async rechazarSolicitud(sol: any) {
    await updateDoc(doc(db, 'solicitudes', sol.id), {
      estado: 'rechazada'
    });

    alert('Solicitud rechazada');

    await this.cargarSolicitudes();
  }

  // Configuración
  async cambiarNombre() {
    if (!this.nuevoNombre.trim()) return;
    await this.userService.actualizarNombre(this.uid, this.nuevoNombre);
    this.userName = this.nuevoNombre;
    this.userInitial = this.nuevoNombre.charAt(0).toUpperCase();
    this.nuevoNombre = '';
    this.cdr.detectChanges();
  }

  async cambiarCorreo() {
    if (!this.nuevoCorreo.trim()) return;
    await this.userService.actualizarCorreo(this.uid, this.nuevoCorreo);
    this.userEmail = this.nuevoCorreo;
    this.nuevoCorreo = '';
    this.cdr.detectChanges();
  }

  async cambiarPassword() {
    if (!this.nuevaPass.trim()) return;
    await this.userService.actualizarPassword(this.nuevaPass);
    this.nuevaPass = '';
    this.cdr.detectChanges();
  }

  async cambiarFoto() {
    if (!this.nuevaFoto.trim()) return;
    await this.userService.actualizarFoto(this.uid, this.nuevaFoto);
    this.foto = this.nuevaFoto;
    this.nuevaFoto = '';
    this.cdr.detectChanges();
  }

  async cambiarModoOscuro() {
    await this.userService.actualizarModoOscuro(this.uid, this.modoOscuro);
    document.body.classList.toggle('dark-mode', this.modoOscuro);
    this.cdr.detectChanges();
  }

  logout() {
    auth.signOut();
  }
}