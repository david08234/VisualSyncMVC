export type Rol = 'Admin' | 'Cliente';

export interface Usuario {
  idUsuario: number;
  nombreCompleto: string;
  rol: Rol;
  email?: string;
}

export interface PaqueteServicio {
  idPaquete?: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  cantidadFotos: number;
  incluyeVideo: boolean;
  activo: boolean;
}

export interface Reserva {
  idReserva?: number;
  idUsuario: number;
  idPaquete: number;
  fechaEvento: string;
  lugarEvento: string;
  estadoReserva: string;
  estadoPago: string;
  rutaComprobanteQR?: string | null;
  motivoRechazo?: string | null;
  descargasHabilitadas: boolean;
  paquete?: PaqueteServicio;
  usuario?: Usuario;
}

export interface ArchivoGaleria {
  idArchivo?: number;
  idReserva: number;
  rutaBajaRes: string;
  rutaAltaRes: string;
  tipoArchivo: string;
  seleccionadaPorCliente: boolean;
}