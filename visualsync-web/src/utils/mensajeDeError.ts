import axios from 'axios';

export function mensajeDeError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    if (!e.response) {
      return 'No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.';
    }

    const d = e.response.data as
      | { errors?: Record<string, string[]>; detail?: string }
      | undefined;

    if (d?.errors) return Object.values(d.errors).flat().join(' ');
    if (d?.detail) return d.detail;

    if (e.response.status === 401) return 'Tu sesión no es válida. Inicia sesión de nuevo.';
    if (e.response.status === 403) return 'No tienes permiso para realizar esta acción.';
    if (e.response.status === 404) return 'No se encontró el recurso solicitado.';
  }
  return 'Ocurrió un error inesperado.';
}