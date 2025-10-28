// TurisNow: User Reservations Management Page
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import reservaService from '../services/reservaService';
import type { ReservaDetalleDTO } from '../services/reservaService';

const MisReservas: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados
  const [reservas, setReservas] = useState<ReservaDetalleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Verificar autenticación y mensajes
  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { redirectUrl: '/mis-reservas' }
      });
      return;
    }

    // Mensaje de éxito desde la navegación
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Limpiar el estado después de mostrarlo
      window.history.replaceState({}, document.title);
    }
  }, [user, navigate, location.state]);

  // Cargar reservas cuando cambien los filtros o la página
  useEffect(() => {
    if (user) {
      loadReservas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filtroEstado, user]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reservaService.obtenerMisReservas(
        currentPage, 
        6, // 6 reservas por página
        filtroEstado || undefined
      );
      
      setReservas(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      console.error('Error loading reservations:', err);
      setError(err.message || 'Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEstadoFilter = (estado: string) => {
    setFiltroEstado(estado);
    setCurrentPage(0); // Reset a la primera página
  };

  const handleCancelarReserva = async (reservaId: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      await reservaService.cancelarReserva(reservaId);
      setSuccessMessage('Reserva cancelada exitosamente');
      loadReservas(); // Recargar la lista
    } catch (err: any) {
      setError(err.message || 'Error al cancelar la reserva');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, string> = {
      'PENDIENTE': 'bg-warning text-dark',
      'CONFIRMADA': 'bg-success',
      'CANCELADA': 'bg-danger',
      'COMPLETADA': 'bg-info',
      'PAGADA': 'bg-primary'
    };
    return badges[estado.toUpperCase()] || 'bg-secondary';
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  if (loading && (!reservas || reservas.length === 0)) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando tus reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ paddingTop: '120px' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-calendar-check text-primary me-2"></i>
                Mis Reservas
              </h2>
              <p className="text-muted mb-0">
                Gestiona tus reservas de experiencias
              </p>
            </div>
            <Link to="/experiencias" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              Nueva Reserva
            </Link>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="fas fa-check-circle me-2"></i>
              {successMessage}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccessMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-light">
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className={`btn btn-sm ${filtroEstado === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleEstadoFilter('')}
                    >
                      Todas ({totalElements})
                    </button>
                    <button
                      className={`btn btn-sm ${filtroEstado === 'PENDIENTE' ? 'btn-warning text-dark' : 'btn-outline-warning'}`}
                      onClick={() => handleEstadoFilter('PENDIENTE')}
                    >
                      Pendientes
                    </button>
                    <button
                      className={`btn btn-sm ${filtroEstado === 'CONFIRMADA' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleEstadoFilter('CONFIRMADA')}
                    >
                      Confirmadas
                    </button>
                    <button
                      className={`btn btn-sm ${filtroEstado === 'COMPLETADA' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => handleEstadoFilter('COMPLETADA')}
                    >
                      Completadas
                    </button>
                    <button
                      className={`btn btn-sm ${filtroEstado === 'CANCELADA' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => handleEstadoFilter('CANCELADA')}
                    >
                      Canceladas
                    </button>
                  </div>
                </div>
                <div className="col-md-4 text-end">
                  <small className="text-muted">
                    {loading ? 'Actualizando...' : `${reservas?.length || 0} de ${totalElements} reservas`}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ms-3"
                onClick={loadReservas}
              >
                <i className="fas fa-retry me-1"></i>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Reservas */}
      {(!reservas || reservas.length === 0) && !loading ? (
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '4rem' }}></i>
              <h4 className="text-muted">No tienes reservas</h4>
              <p className="text-muted mb-4">
                {filtroEstado ? 
                  `No tienes reservas en estado "${filtroEstado.toLowerCase()}"` :
                  'Aún no has realizado ninguna reserva'
                }
              </p>
              <Link to="/experiencias" className="btn btn-primary">
                <i className="fas fa-search me-2"></i>
                Explorar Experiencias
              </Link>
            </div>
          </div>
        </div>
      ) : reservas && reservas.length > 0 ? (
        <>
          {/* Cards de Reservas */}
          <div className="row">
            {reservas.map((reserva) => (
              <div key={reserva.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 shadow-sm">
                  {/* Header de la card */}
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      Reserva #{reserva.id}
                    </small>
                    <span className={`badge ${getEstadoBadge(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div className="card-body">
                    {/* Título de la experiencia */}
                    <h6 className="card-title text-primary mb-2">
                      {reserva.tituloExperiencia}
                    </h6>

                    {/* Ubicación */}
                    <p className="text-muted mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {reserva.ciudadExperiencia}, {reserva.paisExperiencia}
                    </p>

                    {/* Fecha */}
                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        {new Date(reserva.fechaInicio).toLocaleDateString('es-AR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </small>
                    </div>

                    {/* Horario */}
                    <div className="mb-2">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        {new Date(reserva.fechaInicio).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(reserva.fechaFin).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>

                    {/* Personas y Precio */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">
                          <i className="fas fa-users me-1"></i>
                          {reserva.cantidadPersonas} persona{reserva.cantidadPersonas > 1 ? 's' : ''}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary">
                          {formatPrice(reserva.precioTotal)}
                        </div>
                      </div>
                    </div>

                    {/* Fecha de reserva */}
                    <div className="mb-3">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Reservado el {new Date(reserva.fechaReserva).toLocaleDateString('es-AR')}
                      </small>
                    </div>

                    {/* Observaciones */}
                    {reserva.observaciones && (
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="fas fa-comment me-1"></i>
                          {reserva.observaciones}
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Footer con acciones */}
                  <div className="card-footer bg-transparent">
                    <div className="d-flex gap-2">
                      <Link
                        to={`/experiencias/${reserva.salidaId}`}
                        className="btn btn-sm btn-outline-primary flex-fill"
                      >
                        <i className="fas fa-eye me-1"></i>
                        Ver
                      </Link>
                      
                      {(reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelarReserva(reserva.id)}
                          title="Cancelar reserva"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="row">
              <div className="col-12">
                <nav aria-label="Navegación de reservas">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, index) => (
                      <li 
                        key={index} 
                        className={`page-item ${currentPage === index ? 'active' : ''}`}
                      >
                        <button 
                          className="page-link"
                          onClick={() => handlePageChange(index)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default MisReservas;