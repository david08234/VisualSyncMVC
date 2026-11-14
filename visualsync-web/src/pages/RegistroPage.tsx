import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { registroSchema } from '../schemas';
import { registrarUsuario } from '../api/auth';
import { mensajeDeError } from '../utils/mensajeDeError';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';

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
    <AuthLayout>
      <h1 className="h3 vs-title mb-1">Tu historia empieza aquí</h1>
      <p className="text-secondary small mb-4">Crea tu cuenta y encuentra la sesión perfecta para ti.</p>

      {errorApi && <div className="alert alert-danger py-2 small">{errorApi}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            autoComplete="name"
            placeholder="Tu nombre y apellidos"
            className={`form-control ${errors.nombreCompleto ? 'is-invalid' : ''}`}
            {...register('nombreCompleto')}
          />
          {errors.nombreCompleto && (
            <div className="invalid-feedback d-block">{errors.nombreCompleto.message}</div>
          )}
        </div>

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

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Crea una contraseña"
            invalido={!!errors.password}
            {...register('password')}
          />
          {errors.password ? (
            <div className="invalid-feedback d-block">{errors.password.message}</div>
          ) : (
            <div className="form-text">Mínimo 8 caracteres.</div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label">Confirmar contraseña</label>
          <PasswordInput
            autoComplete="new-password"
            placeholder="Repite la contraseña"
            invalido={!!errors.confirmar}
            {...register('confirmar')}
          />
          {errors.confirmar && <div className="invalid-feedback d-block">{errors.confirmar.message}</div>}
        </div>

        <button type="submit" className="btn vs-btn w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-muted small mt-4 mb-0">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-dark fw-semibold">Inicia sesión</Link>
      </p>
    </AuthLayout>
  );
}