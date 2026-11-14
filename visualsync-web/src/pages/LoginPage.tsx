import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { loginSchema } from '../schemas';
import { loginUsuario } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { mensajeDeError } from '../utils/mensajeDeError';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

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
    <AuthLayout>
      <h1 className="h3 vs-title mb-1">Bienvenido de nuevo</h1>
      <p className="text-secondary small mb-4">Accede a tus reservas y a tus mejores recuerdos.</p>

      {recienRegistrado && (
        <div className="alert alert-success py-2 small">Cuenta creada. Ya puedes iniciar sesión.</div>
      )}
      {errorApi && <div className="alert alert-danger py-2 small">{errorApi}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email')}
          />
          {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
        </div>

        <div className="mb-4">
          <label className="form-label">Contraseña</label>
          <PasswordInput
            autoComplete="current-password"
            placeholder="••••••••"
            invalido={!!errors.password}
            {...register('password')}
          />
          {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
        </div>

        <button type="submit" className="btn vs-btn w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Iniciando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-center text-muted small mt-4 mb-0">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/registro" className="text-dark fw-semibold">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}