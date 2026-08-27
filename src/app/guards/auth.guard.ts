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

    return new Promise((resolve) => {

      onAuthStateChanged(auth, (user) => {

        // ⭐ Firebase inicializa en dos pasos:
        // 1) null → NO permitir Home
        // 2) usuario → permitir Home

        if (user === null) {
          // Todavía no está listo → NO permitir Home
          resolve(false);
          this.router.navigate(['/login']);
          return;
        }

        // Usuario listo → permitir Home
        resolve(true);
      });

    });

  }
}