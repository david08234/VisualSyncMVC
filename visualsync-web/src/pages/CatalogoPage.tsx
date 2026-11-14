import { useEffect, useState } from 'react';
import { client } from '../api/client';
import PaqueteCard from '../components/PaqueteCard';
import type { PaqueteVista } from '../components/PaqueteCard';
import { mensajeDeError } from '../utils/mensajeDeError';

export default function CatalogoPage() {
  const [paquetes, setPaquetes] = useState<PaqueteVista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    client
      .get<PaqueteVista[]>('/PaquetesServicio')
      .then((r) => setPaquetes(r.data))
      .catch((e) => setError(mensajeDeError(e)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="container py-5">
      <header className="text-center mb-5">
        <div className="vs-eyebrow mb-2">Fotografía con intención</div>
        <h1 className="vs-title display-6 mb-2">Nuestros Paquetes Fotográficos</h1>
        <p className="text-secondary mb-0">
          Capturamos momentos inolvidables. Elige cómo quieres recordarlos.
        </p>
      </header>

      {cargando && (
        <div className="text-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted small mt-3 mb-0">
            Cargando paquetes. Si el servidor estaba inactivo, puede tardar unos segundos.
          </p>
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!cargando && !error && paquetes.length === 0 && (
        <p className="text-center text-muted">Todavía no hay paquetes disponibles.</p>
      )}

      <div className="row g-4">
        {paquetes.map((p) => (
          <div key={p.idPaquete} className="col-12 col-md-6 col-lg-4">
            <PaqueteCard paquete={p} />
          </div>
        ))}
      </div>

      <p className="text-center text-muted small mt-5 mb-0">
        ¿Buscas algo diferente?{' '}
        <a href="mailto:contacto@visualsync.com" className="text-dark fw-semibold">
          Hablemos de tu sesión
        </a>
      </p>
    </div>
  );
}