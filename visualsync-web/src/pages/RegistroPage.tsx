import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { registroSchema } from '../schemas';
import { registrarUsuario } from '../api/auth';
import { mensajeDeError } from '../utils/mensajeDeError';

type RegistroForm = z.infer<typeof registroSchema>;

export default function RegistroPage() {
  const [errorApi, setErrorApi] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroForm>({ resolver: zodResolver(registroSchema) });

  const onSubmit = async (data: RegistroForm) => {
    setErrorApi('');
    try {
      await registrarUsuario({
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        password: data.password,
      });
      navigate('/login', { state: { registrado: true } });
    } catch (error) {
      setErrorApi(mensajeDeError(error));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm border-0 mt-5">
          <div className="card-body p-4">
            <h3 className="text-center mb-4 fw-bold text-primary">Crear cuenta</h3>

            {errorApi && <div className="alert alert-danger py-2">{errorApi}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre completo</label>
                <input
                  type="text"
                  autoComplete="name"
                  className={`form-control ${errors.nombreCompleto ? 'is-invalid' : ''}`}
                  {...register('nombreCompleto')}
                />
                <div className="invalid-feedback">{errors.nombreCompleto?.message}</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  autoComplete="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email')}
                />
                <div className="invalid-feedback">{errors.email?.message}</div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                />
                <div className="invalid-feedback">{errors.password?.message}</div>
                <div className="form-text">Mínimo 8 caracteres.</div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Confirmar contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={`form-control ${errors.confirmar ? 'is-invalid' : ''}`}
                  {...register('confirmar')}
                />
                <div className="invalid-feedback">{errors.confirmar?.message}</div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando cuenta...' : 'Registrarme'}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">¿Ya tienes cuenta? </span>
              <Link to="/login" className="text-decoration-none fw-bold">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}