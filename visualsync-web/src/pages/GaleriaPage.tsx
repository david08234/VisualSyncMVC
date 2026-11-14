import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerReserva } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import type { Reserva } from '../types';
import EstadoPagoBadge from '../components/EstadoPagoBadge';
import Loading from '../components/Loading';

export default function GaleriaPage() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerReserva(Number(id))
      .then(setReserva)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!reserva) return <div className="alert alert-danger mt-4 shadow-sm border-0">No se pudo encontrar la reserva.</div>;
  if (!usuario || reserva.idUsuario !== usuario.idUsuario) {
    return <div className="alert alert-danger mt-4 shadow-sm border-0">No tienes permiso para acceder a esta galería.</div>;
  }

  const pagoAprobado = reserva.estadoPago === 'Aprobado';

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ color: '#14213D' }}>Tu Galería Privada</h2>
      
      <div className="mb-4">
        <span className="fw-bold me-2">Estado de tu pago:</span>
        <EstadoPagoBadge estado={reserva.estadoPago} />
      </div>

      <div className={`alert ${pagoAprobado ? 'alert-success' : 'alert-warning'} shadow-sm border-0 mb-4`}>
        {pagoAprobado 
          ? '¡Tu pago ha sido validado! Ya puedes descargar todas tus fotografías en alta resolución.' 
          : 'La descarga de archivos estará bloqueada hasta que el administrador valide tu comprobante de pago.'}
      </div>

      <div className="row g-4">
        {/* Simulamos 4 fotos de muestra de la galería */}
        {[1, 2, 3, 4].map(foto => (
          <div key={foto} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div className="card shadow-sm border-0 h-100">
              <div 
                className="bg-secondary text-white d-flex align-items-center justify-content-center" 
                style={{ height: '200px', backgroundColor: '#e2e8f0' }}
              >
                📷 Fotografía {foto}
              </div>
              <div className="card-footer bg-white border-0 p-3">
                <button 
                  className={`btn w-100 fw-bold ${pagoAprobado ? 'btn-primary' : 'btn-light text-muted'}`}
                  disabled={!pagoAprobado}
                >
                  {pagoAprobado ? 'Descargar' : '🔒 Bloqueado'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}