import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { auth } from '../services/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(auth, user => {

        // Firebase inicializa en dos pasos:
        // 1) user = null (NO ES ERROR)
        // 2) user = usuario real

        if (user === null) {
          // Esperar a que Firebase termine de inicializar
          setTimeout(() => {
            if (auth.currentUser) {
              resolve(true);
            } else {
              this.router.navigate(['/login']);
              resolve(false);
            }
          }, 80);
          return;
        }

        resolve(true);
      });
    });
  }
}
