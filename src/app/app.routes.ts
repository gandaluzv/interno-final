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
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'encuesta', component: Encuesta },
    { path: 'musica', component: Musica },
    { path: 'pelis', component: Pelis },
    { path: 'libros', component: Libros },
    { path: 'recomendar', component: Recomendar },
    { path: 'prueba', component: Prueba },  
    { path: 'chat', component: Chat },
    { path: 'cuenta', component: Cuenta },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
    