import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { obtener } from '../api/paquetes';
import { crearReserva, actualizarReserva } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import type { PaqueteServicio } from '../types';

const reservaSchema = z.object({
  fechaEvento: z.string().min(1, 'Selecciona la fecha y hora.'),
  lugarEvento: z.string().min(5, 'Especifica el lugar del evento.')
});

export default function SolicitarReservaPage() {
  const { idPaquete } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [paquete, setPaquete] = useState<PaqueteServicio | null>(null);
  const [errorApi, setErrorApi] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(reservaSchema)
  });

  useEffect(() => {
    if (idPaquete) {
      obtener(Number(idPaquete))
        .then(setPaquete)
        .catch(() => setErrorApi('No se pudo cargar la información del paquete.'));
    }
  }, [idPaquete]);

  const onSubmit = async (data: any) => {
    setErrorApi('');
    try {
      // 1. Creamos la reserva inicial
      const nuevaReserva = {
        idUsuario: usuario?.idUsuario,
        idPaquete: Number(idPaquete),
        fechaEvento: data.fechaEvento,
        lugarEvento: data.lugarEvento,
        estadoReserva: 'Solicitada',
        estadoPago: 'SinComprobante',
        descargasHabilitadas: false
      };
      
      const reservaCreada = await crearReserva(nuevaReserva);

      // 2. Simulamos la subida del comprobante actualizando el estado de pago
      const reservaConPago = { ...reservaCreada, estadoPago: 'PendienteValidacion' };
      await actualizarReserva(reservaCreada.idReserva!, reservaConPago);

      navigate('/mis-reservas');
    } catch {
      setErrorApi('Ocurrió un error al enviar la solicitud. Intenta nuevamente.');
    }
  };

  if (!paquete) {
    if (errorApi) {
      return <div className="container py-4"><div className="alert alert-danger">{errorApi}</div></div>;
    }

    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando paquete...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center py-4">
      <div className="col-12 col-lg-8">
        <h2 className="fw-bold mb-4" style={{ color: '#14213D' }}>Completar Reserva</h2>
        
        <div className="card border-0 shadow-sm mb-4 bg-light">
          <div className="card-body">
            <h5 className="fw-bold text-primary">Resumen del paquete: {paquete.nombre}</h5>
            <p className="mb-0 text-muted">Total a pagar: <strong>Bs. {paquete.precio}</strong></p>
          </div>
        </div>

        {errorApi && <div className="alert alert-danger">{errorApi}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Fecha y Hora</label>
                  <input type="datetime-local" className={`form-control ${errors.fechaEvento ? 'is-invalid' : ''}`} {...register('fechaEvento')} />
                  <div className="invalid-feedback">{errors.fechaEvento?.message as string}</div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Lugar del Evento</label>
                  <input type="text" placeholder="Ej. Salón Los Pinos" className={`form-control ${errors.lugarEvento ? 'is-invalid' : ''}`} {...register('lugarEvento')} />
                  <div className="invalid-feedback">{errors.lugarEvento?.message as string}</div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="text-center mb-4">
                <h5 className="fw-bold mb-3">Pago por QR</h5>
                <div className="p-3 bg-light rounded d-inline-block border">
                  <div style={{ width: '150px', height: '150px', background: '#ccc', margin: '0 auto' }} className="d-flex align-items-center justify-content-center text-muted">
                    [Código QR]
                  </div>
                </div>
                <p className="text-muted small mt-2">Escanea para pagar y simula la subida del comprobante al enviar.</p>
              </div>

              <button type="submit" className="btn w-100 fw-bold py-2" style={{ backgroundColor: '#14213D', color: 'white' }} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Enviar solicitud de reserva'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}