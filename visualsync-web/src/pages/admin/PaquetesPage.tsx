import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { listar, crear, actualizar, desactivar } from '../../api/paquetes';
import type { PaqueteServicio } from '../../types';
import Loading from '../../components/Loading';
import ErrorAlert from '../../components/ErrorAlert';

const paqueteSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  descripcion: z.string().min(5, 'Mínimo 5 caracteres'),
  precio: z.coerce.number().min(0, 'No puede ser negativo'),
  duracion: z.coerce.number().min(1, 'Requerido'),
  cantidadFotos: z.coerce.number().min(1, 'Requerido'),
  incluyeVideo: z.boolean().default(false),
  activo: z.boolean().default(true)
});

export default function PaquetesPage() {
  const [paquetes, setPaquetes] = useState<PaqueteServicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modoEdicion, setModoEdicion] = useState<PaqueteServicio | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(paqueteSchema),
    defaultValues: { incluyeVideo: false, activo: true }
  });

  const cargarPaquetes = () => {
    setLoading(true);
    listar()
      .then(setPaquetes)
      .catch(() => setError('Error al cargar los paquetes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarPaquetes(); }, []);

  const onSubmit = async (data: any) => {
    setError('');
    try {
      if (modoEdicion?.idPaquete) {
        await actualizar(modoEdicion.idPaquete, data);
      } else {
        await crear(data);
      }
      setMostrarFormulario(false);
      setModoEdicion(null);
      reset();
      cargarPaquetes();
    } catch {
      setError('Error al guardar el paquete. Revisa los datos.');
    }
  };

  const handleEditar = (p: PaqueteServicio) => {
    setModoEdicion(p);
    reset(p);
    setMostrarFormulario(true);
  };

  const handleDesactivar = async (id: number) => {
    if (!window.confirm('¿Desactivar este paquete? Ya no aparecerá en el catálogo público.')) return;
    try {
      await desactivar(id);
      cargarPaquetes();
    } catch {
      setError('No se pudo desactivar el paquete.');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0" style={{ color: '#14213D' }}>Gestión de Paquetes</h2>
        <button 
          className="btn btn-primary fw-bold" 
          onClick={() => { setMostrarFormulario(!mostrarFormulario); setModoEdicion(null); reset(); }}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo Paquete'}
        </button>
      </div>

      <ErrorAlert mensaje={error} />

      {mostrarFormulario && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body">
            <h5 className="fw-bold text-primary mb-3">{modoEdicion ? 'Editar Paquete' : 'Crear Nuevo Paquete'}</h5>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre del Paquete</label>
                  <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} {...register('nombre')} />
                  <div className="invalid-feedback">{errors.nombre?.message as string}</div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Precio (Bs.)</label>
                  <input type="number" step="0.1" className={`form-control ${errors.precio ? 'is-invalid' : ''}`} {...register('precio')} />
                  <div className="invalid-feedback">{errors.precio?.message as string}</div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Duración (Horas)</label>
                  <input type="number" className={`form-control ${errors.duracion ? 'is-invalid' : ''}`} {...register('duracion')} />
                  <div className="invalid-feedback">{errors.duracion?.message as string}</div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea rows={2} className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`} {...register('descripcion')} />
                  <div className="invalid-feedback">{errors.descripcion?.message as string}</div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Cantidad de Fotos</label>
                  <input type="number" className={`form-control ${errors.cantidadFotos ? 'is-invalid' : ''}`} {...register('cantidadFotos')} />
                  <div className="invalid-feedback">{errors.cantidadFotos?.message as string}</div>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input type="checkbox" className="form-check-input" id="checkVideo" {...register('incluyeVideo')} />
                    <label className="form-check-label fw-semibold" htmlFor="checkVideo">Incluye Grabación de Video</label>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <div className="form-check mb-2">
                    <input type="checkbox" className="form-check-input" id="checkActivo" {...register('activo')} />
                    <label className="form-check-label fw-semibold text-success" htmlFor="checkActivo">Paquete Activo (Visible)</label>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-end">
                <button type="submit" className="btn btn-primary fw-bold px-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar Paquete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <Loading /> : (
        <div className="table-responsive bg-white rounded shadow-sm">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Fotos</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map(p => (
                <tr key={p.idPaquete}>
                  <td className="fw-bold">{p.nombre}</td>
                  <td>Bs. {p.precio}</td>
                  <td>{p.duracion} h</td>
                  <td>{p.cantidadFotos}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'bg-success' : 'bg-secondary'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditar(p)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDesactivar(p.idPaquete!)}>Desactivar</button>
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