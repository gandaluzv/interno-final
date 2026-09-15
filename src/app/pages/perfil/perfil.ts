import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { db, auth } from '../../services/firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Usuario } from '../../models/usuario';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'perfil-page',
  standalone: true,
  imports: [CommonModule, RouterModule, SearchBar],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilPage implements OnInit {

  usuario?: Usuario;
  userName = '';
  userEmail = '';
  userInitial = '';
  preferencias: any = {};

  currentUserName = '';
  currentUserEmail = '';
  currentUserInitial = '';
  currentPreferencias: any = {};

  metricGustos = '0 activos';
  metricColeccion = '0 likes';
  metricComunidad = '0 amigos';

  miUid = auth.currentUser?.uid ?? '';

  // ⭐ Estado del botón
  estadoAmistad: 'ninguno' | 'amigos' | 'pendiente' | 'recibida' = 'ninguno';

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {

    // Usuario en sesión
    const user = auth.currentUser;
    if (user) {
      const ref = doc(db, 'usuarios', user.uid);
      const snap = await getDoc(ref);
      const data = snap.data() as Usuario;

      this.currentUserName = data['usuario'] ?? '';
      this.currentUserEmail = data['email'] ?? '';
      this.currentUserInitial = this.currentUserName.charAt(0).toUpperCase();
      this.currentPreferencias = data['preferencias'] ?? {};
    }

    // Usuario buscado
    const uid = this.route.snapshot.paramMap.get('uid');
    if (!uid) return;

    const refPerfil = doc(db, 'usuarios', uid);
    const snapPerfil = await getDoc(refPerfil);
    const perfilData = snapPerfil.data() as Usuario;

    this.usuario = perfilData;

    this.userName = perfilData['usuario'] ?? '';
    this.userEmail = perfilData['email'] ?? '';
    this.userInitial = this.userName.charAt(0).toUpperCase();
    this.preferencias = perfilData['preferencias'] ?? {};

    // Métricas
    const prefs = this.preferencias;
    const activos = [
      prefs.musica ? 1 : 0,
      prefs.libros ? 1 : 0,
      prefs.peliculas ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    this.metricGustos = `${activos} activos`;

    // ⭐ Detectar estado de amistad
    const amigoUid = perfilData['id_usuario'];

    // 1️⃣ Ya son amigos
    const refAmigo = doc(db, 'amigos', `${this.miUid}_${amigoUid}`);
    const snapAmigo = await getDoc(refAmigo);

    if (snapAmigo.exists()) {
      this.estadoAmistad = 'amigos';
      this.cdr.detectChanges();
      return;
    }

    // 2️⃣ Ya enviaste solicitud
    const refSolEnviada = doc(db, 'solicitudes', `${this.miUid}_${amigoUid}`);
    const snapSolEnviada = await getDoc(refSolEnviada);

    if (snapSolEnviada.exists() && snapSolEnviada.data()?.['estado'] === 'pendiente') {
      this.estadoAmistad = 'pendiente';
      this.cdr.detectChanges();
      return;
    }

    // 3️⃣ Te enviaron solicitud
    const refSolRecibida = doc(db, 'solicitudes', `${amigoUid}_${this.miUid}`);
    const snapSolRecibida = await getDoc(refSolRecibida);

    if (snapSolRecibida.exists() && snapSolRecibida.data()?.['estado'] === 'pendiente') {
      this.estadoAmistad = 'recibida';
      this.cdr.detectChanges();
      return;
    }

    this.cdr.detectChanges();
  }

  logout() {
    auth.signOut();
  }

  // ⭐ Enviar solicitud
  async enviarSolicitud() {
    if (!this.usuario || !this.miUid) return;

    const amigoUid = this.usuario['id_usuario'] ?? '';

    const refSol = doc(db, 'solicitudes', `${this.miUid}_${amigoUid}`);
    const snapSol = await getDoc(refSol);

    if (snapSol.exists()) {
      alert('Ya enviaste una solicitud');
      return;
    }

    await setDoc(refSol, {
      de: this.miUid,
      a: amigoUid,
      estado: 'pendiente',
      fecha: Date.now()
    });

    alert('Solicitud enviada');
    this.estadoAmistad = 'pendiente';
    this.cdr.detectChanges();
  }

}
