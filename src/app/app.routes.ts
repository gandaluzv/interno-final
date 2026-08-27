import { AuthGuard } from './guards/auth.guard';

import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Encuesta } from './pages/encuesta/encuesta';
import { Musica } from './pages/musica/musica';
import { Pelis } from './pages/pelis/pelis';
import { Libros } from './pages/libros/libros';
import { Recomendar } from './pages/recomendar/recomendar';
import { Prueba } from './pages/prueba/prueba';
import { Chat } from './pages/chat/chat';
import { Cuenta} from './pages/cuenta/cuenta';

export const routes: Routes = [
    { path: 'home', component: Home, canActivate: [AuthGuard] },
    { path: 'login', component: Login },

    { path: 'encuesta', component: Encuesta, canActivate: [AuthGuard] },
    { path: 'musica', component: Musica, canActivate: [AuthGuard] },
    { path: 'pelis', component: Pelis, canActivate: [AuthGuard] },
    { path: 'libros', component: Libros, canActivate: [AuthGuard] },
    { path: 'recomendar', component: Recomendar, canActivate: [AuthGuard] },
    { path: 'prueba', component: Prueba, canActivate: [AuthGuard] },
    { path: 'chat', component: Chat, canActivate: [AuthGuard] },
    { path: 'cuenta', component: Cuenta, canActivate: [AuthGuard] },

    { path: '', redirectTo: 'login', pathMatch: 'full' }
];