import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useFavoritos } from '../../hooks/useFavoritos';
import { useCarrito } from '../../hooks/useCarrito';

const Header = () => {
  const { user, logout } = useAuth();
  const { cantidadFavoritos } = useFavoritos();
  const { cantidadTotal } = useCarrito();
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100); // Aumentado de 50 a 100 para mejor detección
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string, lastName?: string) => {
    if (!name && !lastName) return 'U';
    const firstInitial = name ? name[0] : '';
    const lastInitial = lastName ? lastName[0] : '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  };

  return (
    <div className={`container-fluid position-relative p-0 ${!isSticky ? 'navbar-at-top' : 'navbar-sticky'}`}>
      <nav className={`navbar navbar-expand-lg navbar-light px-4 px-lg-5 py-3 py-lg-0 ${isSticky ? 'sticky-top scrolled' : 'atTop'}`}>
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
              <Link to="/likes" className="btn btn-icon me-2 position-relative" aria-label="Favoritos">
                <i className="fa fa-heart"></i>
                {cantidadFavoritos > 0 && (
                  <span className="tn-badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
                    {cantidadFavoritos}
                  </span>
                )}
              </Link>
              {/* Carrito */}
              <Link to="/cart" className="btn btn-icon me-3 position-relative" aria-label="Carrito de compras">
                <i className="fa fa-shopping-cart"></i>
                {cantidadTotal > 0 && (
                  <span className="tn-badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
                    {cantidadTotal}
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
                    id="userDropdown"
                  >
                    <div className="user-avatar">
                      {getInitials(user.nombre, user.apellido)}
                    </div>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><Link to="/perfil" className="dropdown-item">Mi Perfil</Link></li>
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