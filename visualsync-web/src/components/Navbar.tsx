import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);

  if (pathname === '/login' || pathname === '/registro') return null;

  const cerrar = () => setAbierto(false);
  const salir = () => {
    logout();
    cerrar();
    navigate('/');
  };

  return (
    <nav className="vs-nav sticky-top">
      <div className="container d-flex flex-wrap align-items-center justify-content-between py-3">
        <Link to="/" className="vs-brand" onClick={cerrar}>VisualSync</Link>

        <button
          type="button"
          className="btn border-0 p-0 d-md-none"
          aria-label="Abrir menú"
          onClick={() => setAbierto(!abierto)}
        >
          <i className="bi bi-list fs-2" />
        </button>

        <div className={`vs-menu ${abierto ? 'vs-menu--abierto' : ''}`}>
          <NavLink to="/" end className="vs-link" onClick={cerrar}>Servicios</NavLink>

          {!usuario && (
            <Link to="/login" className="btn vs-btn vs-btn--sm" onClick={cerrar}>Login</Link>
          )}

          {usuario?.rol === 'Cliente' && (
            <>
              <NavLink to="/mis-reservas" className="vs-link" onClick={cerrar}>Mis reservas</NavLink>
              <button type="button" className="vs-btn-outline" onClick={salir}>Cerrar sesión</button>
            </>
          )}

          {usuario?.rol === 'Admin' && (
            <>
              <NavLink to="/admin" end className="vs-link" onClick={cerrar}>Panel</NavLink>
              <NavLink to="/admin/paquetes" className="vs-link" onClick={cerrar}>Paquetes</NavLink>
              <button type="button" className="vs-btn-outline" onClick={salir}>Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}