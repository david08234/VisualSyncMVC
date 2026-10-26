import { client } from './client';
import type { Usuario } from '../types';

export interface LoginResponse {
  token: string;
  expiraEnMinutos: number;
  usuario: Usuario;
}

export const loginUsuario = (datos: { email: string; password: string }) =>
  client
    .post<LoginResponse>('/auth/login', {
      email: datos.email,
      password: datos.password,
    })
    .then((r) => r.data);

export const registrarUsuario = (datos: {
  nombreCompleto: string;
  email: string;
  password: string;
}) =>
  client
    .post('/auth/registro', {
      nombreCompleto: datos.nombreCompleto,
      email: datos.email,
      password: datos.password,
    })
    .then((r) => r.data);