import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarReservas, eliminarReserva } from '../api/reservas';
import { useAuth } from '../context/AuthContext';
import type { Reserva } from '../types';
import EstadoPagoBadge from '../components/EstadoPagoBadge';

export default function MisReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { usuario } = useAuth();

  const cargarReservas = () => {
    setLoading(true);
    listarReservas()
      .then(data => {
        // Filtramos solo las reservas del cliente logueado
        const misReservas = data.filter(r => r.idUsuario === usuario?.idUsuario);
        setReservas(misReservas);
        setError('');
      })
      .catch(() => setError('No se pudieron cargar tus reservas.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarReservas();
  }, [usuario]);

  const handleCancelar = async (id: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
    try {
      await eliminarReserva(id);
      cargarReservas();
    } catch {
      alert('Error al cancelar la reserva.');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ color: '#14213D' }}>Mis Reservas</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando reservas...</span>
          </div>
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && reservas.length === 0 && (
        <div className="alert alert-info text-center shadow-sm border-0">
          Aún no tienes reservas. ¡Visita el catálogo para empezar!
        </div>
      )}

      {!loading && reservas.length > 0 && (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Fecha y Lugar</th>
                <th>Estado</th>
                <th>Pago</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.idReserva}>
                  <td>
                    <div className="fw-bold">{new Date(r.fechaEvento).toLocaleDateString()}</div>
                    <div className="text-muted small">{r.lugarEvento}</div>
                  </td>
                  <td><span className="badge bg-light text-dark border">{r.estadoReserva}</span></td>
                  <td>
                    <EstadoPagoBadge estado={r.estadoPago} />
                    {r.estadoPago === 'Rechazado' && r.motivoRechazo && (
                      <div className="text-danger small mt-1">Motivo: {r.motivoRechazo}</div>
                    )}
                  </td>
                  <td className="text-end">
                    <Link to={`/reservas/${r.idReserva}/galeria`} className="btn btn-sm btn-outline-primary me-2">
                      Galería
                    </Link>
                    
                    {/* NUEVO BOTÓN: Solo aparece si falta comprobante o fue rechazado */}
                    {(r.estadoPago === 'Rechazado' || r.estadoPago === 'SinComprobante') && (
                      <div className="d-inline-block me-2">
                        <label htmlFor={`upload-${r.idReserva}`} className="btn btn-sm btn-warning mb-0" style={{ cursor: 'pointer' }}>
                          Subir Comprobante
                        </label>
                        <input
                          id={`upload-${r.idReserva}`}
                          type="file"
                          style={{ display: 'none' }}
                          accept="image/png, image/jpeg, application/pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            // PRUEBA 10: Validación del formato
                            const formatosValidos = ['image/jpeg', 'image/png', 'application/pdf'];
                            if (!formatosValidos.includes(file.type)) {
                              alert('Formato inválido. Solo se permiten imágenes (JPG, PNG) o PDF.');
                              e.target.value = ''; // Limpia el input para no enviar nada
                              return;
                            }

                            alert('Archivo válido. (Aquí se conectaría con la API para subirlo)');
                          }}
                        />
                      </div>
                    )}

                    {r.estadoReserva === 'Solicitada' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelar(r.idReserva!)}>
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}