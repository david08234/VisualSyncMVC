import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="vs-auth">
      <div className="vs-auth-hero">
        <div className="vs-auth-hero-text">
          <div className="vs-eyebrow text-white-50 mb-2">Fotografía con intención</div>
          <h2 className="fw-bold display-6 mb-2">Momentos que permanecen.</h2>
          <p className="small text-white-50 mb-0">
            Una mirada única para las historias que importan.
          </p>
        </div>
      </div>

      <div className="vs-auth-panel">
        <div className="vs-auth-box">
          <Link to="/" className="vs-brand d-inline-block mb-4">VisualSync</Link>
          <div className="vs-tabs">
            <NavLink to="/login" className="vs-tab">Iniciar sesión</NavLink>
            <NavLink to="/registro" className="vs-tab">Registrarse</NavLink>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}