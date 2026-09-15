export interface Usuario {
  id_usuario: string;
  uid: string;
  usuario: string;
  nombre: string;
  email: string;
  foto?: string;

  preferencias?: {
    musica: boolean;
    libros: boolean;
    peliculas: boolean;
  };
}