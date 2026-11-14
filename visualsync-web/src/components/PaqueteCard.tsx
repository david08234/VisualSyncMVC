import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface PaqueteVista {
  idPaquete: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  cantidadFotos: number;
  incluyeVideo: boolean;
  categoria?: string;
}

const TEMAS = [
  { clave: 'boda', etiqueta: 'Bodas', imagen: '/img/boda.jpg' },
  { clave: 'retrato', etiqueta: 'Retratos', imagen: '/img/retrato.jpg' },
  { clave: 'evento', etiqueta: 'Eventos', imagen: '/img/evento.jpg' },
];

const formatoPrecio = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 });

export default function PaqueteCard({ paquete }: { paquete: PaqueteVista }) {
  const { usuario } = useAuth();
  const [imagenRota, setImagenRota] = useState(false);

  const tema = TEMAS.find((t) => paquete.nombre.toLowerCase().includes(t.clave));
  const etiqueta = (paquete.categoria || tema?.etiqueta || 'Sesión').toUpperCase();
  const destino = usuario ? `/reservar/${paquete.idPaquete}` : '/login';

  return (
    <article className="vs-card">
      {tema && !imagenRota ? (
        <img
          src={tema.imagen}
          alt={paquete.nombre}
          className="vs-card-img"
          loading="lazy"
          onError={() => setImagenRota(true)}
        />
      ) : (
        <div className="vs-card-img vs-card-img--vacia" />
      )}

      <div className="p-4 d-flex flex-column flex-grow-1">
        <span className="vs-eyebrow">{etiqueta}</span>
        <h3 className="h6 fw-bold mt-1 mb-2">{paquete.nombre}</h3>

        <div className="vs-price">
          Bs {formatoPrecio.format(Number(paquete.precio))} <small>/ paquete</small>
        </div>

        <div className="vs-divider" />

        <div className="vs-row">
          <span><i className="bi bi-clock" />Duración</span>
          <strong>{paquete.duracion} {paquete.duracion === 1 ? 'hora' : 'horas'}</strong>
        </div>
        <div className="vs-row">
          <span><i className="bi bi-images" />Cantidad de fotos</span>
          <strong>{paquete.cantidadFotos} fotos</strong>
        </div>
        <div className="vs-row">
          <span><i className="bi bi-camera-video" />Incluye video</span>
          <strong>{paquete.incluyeVideo ? 'Sí' : 'No'}</strong>
        </div>

        <p className="vs-desc">{paquete.descripcion}</p>

        {usuario?.rol !== 'Admin' && (
          <Link to={destino} className="btn vs-btn w-100 mt-auto">
            Reservar ahora <i className="bi bi-arrow-right ms-1" />
          </Link>
        )}
      </div>
    </article>
  );
}