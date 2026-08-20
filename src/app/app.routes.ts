import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Encuesta } from './pages/encuesta/encuesta';
import { Musica } from './pages/musica/musica';
import { Pelis } from './pages/pelis/pelis';
import { Libros } from './pages/libros/libros';
import { Prueba } from './pages/prueba/prueba';


export const routes: Routes = [
    { path: 'home', component: Home},
    { path: 'login', component: Login},
    { path: 'encuesta', component: Encuesta},
    { path: 'musica', component: Musica}, 
    { path: 'pelis', component: Pelis},
    { path: 'libros', component: Libros},
    { path: 'prueba', component: Prueba}
];
    