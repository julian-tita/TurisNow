import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [cartItemCount] = useState(0); // Ejemplo, esto debería venir de un estado global

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container-fluid position-relative p-0">
      <nav className={`navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0 ${isSticky ? 'sticky-top' : ''}`}>
        {/* Marca (Logo) */}
        <Link to="/" className="navbar-brand p-0">
          <h1 className="text-primary m-0">
            <i className="fa fa-map-marker-alt me-3" />
            TurisNow
          </h1>
        </Link>

        {/* Botón Toggler para móvil */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarCollapse"
        >
          <span className="fa fa-bars" />
        </button>

        <div className="collapse navbar-collapse" id="navbarCollapse">
          {/* Navegación Principal */}
          <div className="navbar-nav ms-auto py-0">
            <Link to="/explorar" className="nav-item nav-link">Explorar</Link>
            <Link to="/experiencias" className="nav-item nav-link">Experiencias</Link>
            <Link to="/itinerario" className="nav-item nav-link">Itinerario</Link>
          </div>

          {/* Buscador y Acciones */}
          <div className="d-flex align-items-center ms-lg-4">
            {/* Buscador Desktop */}
            <form className="d-none d-lg-flex me-3">
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Buscar..." />
                <button className="btn btn-primary" type="button"><i className="fa fa-search"></i></button>
              </div>
            </form>

            {/* Acciones Derecha */}
            <div className="d-flex align-items-center">
              {/* Buscador Mobile */}
              <Link to="#" className="btn btn-icon d-lg-none me-2" data-bs-toggle="modal" data-bs-target="#searchModal">
                <i className="fa fa-search"></i>
              </Link>
              {/* Favoritos */}
              <Link to="/favoritos" className="btn btn-icon me-2">
                <i className="fa fa-heart"></i>
              </Link>
              {/* Carrito */}
              <Link to="/carrito" className="btn btn-icon me-3 position-relative">
                <i className="fa fa-shopping-cart"></i>
                {cartItemCount > 0 && (
                  <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Ingresar / Menú de Usuario */}
              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-icon-avatar dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div className="user-avatar">
                      {getInitials(user.nombreCompleto)}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link to="/dashboard" className="dropdown-item">Mi Perfil</Link></li>
                    <li><Link to="/mis-reservas" className="dropdown-item">Mis Reservas</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={handleLogout} className="dropdown-item text-danger">Cerrar Sesión</button></li>
                  </ul>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary rounded-pill py-2 px-4">
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;