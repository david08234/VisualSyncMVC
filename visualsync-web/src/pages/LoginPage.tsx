import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { loginSchema } from '../schemas';
import { loginUsuario } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { mensajeDeError } from '../utils/mensajeDeError';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [errorApi, setErrorApi] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const recienRegistrado = (location.state as { registrado?: boolean } | null)?.registrado;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setErrorApi('');
    try {
      const res = await loginUsuario(data);
      login(res.token, res.usuario);
      navigate(res.usuario.rol === 'Admin' ? '/admin' : '/mis-reservas');
    } catch (error) {
      setErrorApi(mensajeDeError(error));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card shadow-sm border-0 mt-5">
          <div className="card-body p-4">
            <h3 className="text-center mb-4 fw-bold text-primary">Iniciar Sesión</h3>

            {recienRegistrado && (
              <div className="alert alert-success py-2">
                Cuenta creada. Ya puedes iniciar sesión.
              </div>
            )}
            {errorApi && <div className="alert alert-danger py-2">{errorApi}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

              <div className="mb-4">
                <label className="form-label fw-semibold">Contraseña</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                />
                <div className="invalid-feedback">{errors.password?.message}</div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Iniciando...' : 'Ingresar'}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">¿No tienes cuenta? </span>
              <Link to="/registro" className="text-decoration-none fw-bold">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}