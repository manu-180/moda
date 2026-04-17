import { redirect } from 'next/navigation'

// La búsqueda se maneja con SearchOverlay en la barra de navegación;
// esta ruta redirige al inicio.
export default function SearchPage() {
  redirect('/')
}
