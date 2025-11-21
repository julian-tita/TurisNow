// TurisNow: User Reservations Management Page
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import reservaService, { type QRData, type ReservaDetalleDTO } from '../services/reservaService';
import ReservaDetailModal from '../components/reservas/ReservaDetailModal';
import SkeletonCard from '../components/common/SkeletonCard';

const MisReservas: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados
  const [reservas, setReservas] = useState<ReservaDetalleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [qrCodes, setQrCodes] = useState<Record<number, QRData>>({});
  const [qrLoadingIds, setQrLoadingIds] = useState<Record<number, boolean>>({});
  const [qrErrorIds, setQrErrorIds] = useState<Record<number, string>>({});
  const [reservaQrVisible, setReservaQrVisible] = useState<number | null>(null);
  
  // Modal de detalle
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaDetalleDTO | null>(null);
  
  // Filtros avanzados
  const [filtroEstado, setFiltroEstado] = useState<string>(searchParams.get('estado') || '');
  const [busquedaTitulo, setBusquedaTitulo] = useState<string>(searchParams.get('titulo') || '');
  const [fechaDesde, setFechaDesde] = useState<string>(searchParams.get('desde') || '');
  const [fechaHasta, setFechaHasta] = useState<string>(searchParams.get('hasta') || '');
  const [precioMin, setPrecioMin] = useState<string>(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState<string>(searchParams.get('precioMax') || '');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

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
  }, [currentPage, filtroEstado, busquedaTitulo, fechaDesde, fechaHasta, precioMin, precioMax, user]);

  const fetchQRForReserva = useCallback(async (reservaId: number) => {
    setQrErrorIds((prev) => {
      const actualizado = { ...prev };
      delete actualizado[reservaId];
      return actualizado;
    });

    setQrLoadingIds((prev) => ({ ...prev, [reservaId]: true }));

    try {
      const qrData = await reservaService.obtenerQRReserva(reservaId);
      setQrCodes((prev) => ({ ...prev, [reservaId]: qrData }));
    } catch (err: any) {
      const mensaje = err?.message || 'No se pudo obtener el código QR.';
      setQrErrorIds((prev) => ({ ...prev, [reservaId]: mensaje }));
      toast.error(mensaje);
    } finally {
      setQrLoadingIds((prev) => ({ ...prev, [reservaId]: false }));
    }
  }, []);

  const prefetchQRCodes = useCallback((lista: ReservaDetalleDTO[]) => {
    lista.forEach((reserva) => {
      if (!reserva.id) {
        return;
      }
      if (qrCodes[reserva.id] || qrLoadingIds[reserva.id]) {
        return;
      }
      void fetchQRForReserva(reserva.id);
    });
  }, [fetchQRForReserva, qrCodes, qrLoadingIds]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      setError(null);
      setReservaQrVisible(null);

      // Si hay un filtro específico por estado, usar el endpoint con estado
      if (filtroEstado && filtroEstado !== '') {
        const response = await reservaService.obtenerMisReservas(
          currentPage, 
          6, // 6 reservas por página
          filtroEstado
        );
        
        let reservasFiltradas = response.content;
        
        // Aplicar filtros avanzados en client-side
        reservasFiltradas = aplicarFiltrosAvanzados(reservasFiltradas);
        
        setReservas(reservasFiltradas);
        setTotalPages(Math.ceil(reservasFiltradas.length / 6));
        setTotalElements(reservasFiltradas.length);
        prefetchQRCodes(reservasFiltradas);
      } else {
        // Para "Todas", implementar paginación client-side
        const response = await reservaService.obtenerMisReservas(
          0, // Siempre página 0 porque queremos todas
          1000, // Límite alto para obtener todas
          undefined // Sin filtro
        );
        
        let todasLasReservas = response.content;
        
        // Aplicar filtros avanzados
        todasLasReservas = aplicarFiltrosAvanzados(todasLasReservas);
        
        const pageSize = 6;
        
        // Ordenar por fecha de reserva DESC
        const reservasOrdenadas = todasLasReservas.sort((a, b) => 
          new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime()
        );
        
        // Calcular paginación en el cliente
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const reservasPaginadas = reservasOrdenadas.slice(startIndex, endIndex);
        
        setReservas(reservasPaginadas);
        setTotalElements(todasLasReservas.length);
        setTotalPages(Math.ceil(todasLasReservas.length / pageSize));
        prefetchQRCodes(reservasPaginadas);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar las reservas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para aplicar filtros avanzados
  const aplicarFiltrosAvanzados = (reservas: ReservaDetalleDTO[]): ReservaDetalleDTO[] => {
    let resultado = [...reservas];

    // Filtro por título de experiencia
    if (busquedaTitulo.trim()) {
      const busqueda = busquedaTitulo.toLowerCase().trim();
      resultado = resultado.filter(r => 
        r.tituloExperiencia.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rango de fechas (fecha de inicio de la salida)
    if (fechaDesde) {
      const desde = new Date(fechaDesde);
      resultado = resultado.filter(r => 
        new Date(r.fechaInicio) >= desde
      );
    }

    if (fechaHasta) {
      const hasta = new Date(fechaHasta);
      hasta.setHours(23, 59, 59, 999); // Incluir todo el día
      resultado = resultado.filter(r => 
        new Date(r.fechaInicio) <= hasta
      );
    }

    // Filtro por rango de precio
    if (precioMin) {
      const min = parseFloat(precioMin);
      resultado = resultado.filter(r => r.precioTotal >= min);
    }

    if (precioMax) {
      const max = parseFloat(precioMax);
      resultado = resultado.filter(r => r.precioTotal <= max);
    }

    return resultado;
  };

  // Actualizar URL con query params
  const actualizarFiltrosEnURL = () => {
    const params = new URLSearchParams();
    
    if (filtroEstado) params.set('estado', filtroEstado);
    if (busquedaTitulo) params.set('titulo', busquedaTitulo);
    if (fechaDesde) params.set('desde', fechaDesde);
    if (fechaHasta) params.set('hasta', fechaHasta);
    if (precioMin) params.set('precioMin', precioMin);
    if (precioMax) params.set('precioMax', precioMax);

    setSearchParams(params);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusquedaTitulo('');
    setFechaDesde('');
    setFechaHasta('');
    setPrecioMin('');
    setPrecioMax('');
    setCurrentPage(0);
    setSearchParams(new URLSearchParams());
  };

  // Aplicar filtros y actualizar URL
  const aplicarFiltros = () => {
    setCurrentPage(0);
    actualizarFiltrosEnURL();
    loadReservas();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEstadoFilter = (estado: string) => {
    setFiltroEstado(estado);
    setCurrentPage(0); // Reset a la primera página
    actualizarFiltrosEnURL();
  };

  const handleCancelarReserva = async (reservaId: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    // Optimistic UI: Actualizar estado local inmediatamente
    const reservaOriginal = reservas.find(r => r.id === reservaId);
    if (!reservaOriginal) return;

    // Guardar estado anterior para rollback
    const estadoAnterior = reservaOriginal.estado;
    
    // Actualizar UI inmediatamente
    setReservas(prev => 
      prev.map(r => r.id === reservaId 
        ? { ...r, estado: 'CANCELADA' } 
        : r
      )
    );

    // Mostrar toast de loading
    const toastId = toast.loading('Cancelando reserva...');

    try {
      await reservaService.cancelarReserva(reservaId);
      
      // Actualizar toast a éxito
      toast.success('Reserva cancelada exitosamente', { id: toastId });
      
      // Recargar para asegurar sincronización con el servidor
      loadReservas();
    } catch (err: any) {
      // Rollback en caso de error
      setReservas(prev => 
        prev.map(r => r.id === reservaId 
          ? { ...r, estado: estadoAnterior } 
          : r
        )
      );
      
      // Actualizar toast a error
      toast.error(err.message || 'Error al cancelar la reserva', { id: toastId });
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
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => setMostrarFiltros(!mostrarFiltros)}
                  >
                    <i className={`fas fa-filter me-1`}></i>
                    Filtros Avanzados
                  </button>
                  <small className="text-muted">
                    {loading ? 'Actualizando...' : `${reservas?.length || 0} de ${totalElements} reservas`}
                  </small>
                </div>
              </div>

              {/* Panel de Filtros Avanzados */}
              {mostrarFiltros && (
                <div className="mt-3 pt-3 border-top">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small mb-1">
                        <i className="fas fa-search me-1"></i>
                        Buscar por título
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Nombre de la experiencia..."
                        value={busquedaTitulo}
                        onChange={(e) => setBusquedaTitulo(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small mb-1">
                        <i className="fas fa-calendar me-1"></i>
                        Fecha desde
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small mb-1">
                        <i className="fas fa-calendar me-1"></i>
                        Fecha hasta
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small mb-1">
                        <i className="fas fa-dollar-sign me-1"></i>
                        Precio mínimo
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="0"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small mb-1">
                        <i className="fas fa-dollar-sign me-1"></i>
                        Precio máximo
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="999999"
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                      />
                    </div>

                    <div className="col-md-6 d-flex align-items-end">
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={aplicarFiltros}
                      >
                        <i className="fas fa-check me-1"></i>
                        Aplicar Filtros
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={limpiarFiltros}
                      >
                        <i className="fas fa-times me-1"></i>
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {/* Indicador de filtros activos */}
                  {(busquedaTitulo || fechaDesde || fechaHasta || precioMin || precioMax) && (
                    <div className="mt-2">
                      <small className="text-primary">
                        <i className="fas fa-info-circle me-1"></i>
                        Filtros activos: 
                        {busquedaTitulo && ` Título`}
                        {fechaDesde && ` Desde ${fechaDesde}`}
                        {fechaHasta && ` Hasta ${fechaHasta}`}
                        {precioMin && ` Precio ≥ $${precioMin}`}
                        {precioMax && ` Precio ≤ $${precioMax}`}
                      </small>
                    </div>
                  )}
                </div>
              )}
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
      ) : loading ? (
        /* Skeleton Loaders mientras carga */
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-md-6 col-lg-4 mb-4">
              <SkeletonCard variant="reserva" />
            </div>
          ))}
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

                    {reserva.id && reservaQrVisible === reserva.id && (
                      <div className="bg-light border rounded p-3 text-center mb-3">
                        {qrLoadingIds[reserva.id] ? (
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando código QR...</span>
                          </div>
                        ) : qrCodes[reserva.id] ? (
                          <>
                            <img
                              src={qrCodes[reserva.id].qrCodeBase64.startsWith('data:')
                                ? qrCodes[reserva.id].qrCodeBase64
                                : `data:image/png;base64,${qrCodes[reserva.id].qrCodeBase64}`}
                              alt={`Código QR reserva ${reserva.id}`}
                              style={{ maxWidth: '200px', width: '100%' }}
                            />
                            <small className="d-block text-muted mt-2">
                              Código: {qrCodes[reserva.id].tokenQr}
                            </small>
                          </>
                        ) : (
                          <small className="text-muted">
                            No pudimos mostrar el QR. Intenta nuevamente o revisa tu correo.
                          </small>
                        )}

                        {reserva.id && qrErrorIds[reserva.id] && (
                          <small className="d-block text-danger mt-2">
                            {qrErrorIds[reserva.id]}
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer con acciones */}
                  <div className="card-footer bg-transparent">
                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm flex-fill ${reserva.id && reservaQrVisible === reserva.id ? 'btn-secondary' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          if (!reserva.id) {
                            return;
                          }
                          if (reservaQrVisible !== reserva.id) {
                            void fetchQRForReserva(reserva.id);
                          }
                          setReservaQrVisible((prev) => (prev === reserva.id ? null : reserva.id));
                        }}
                        title="Mostrar código QR"
                      >
                        <i className="fas fa-qrcode me-1"></i>
                        {reserva.id && reservaQrVisible === reserva.id ? 'Ocultar QR' : 'Ver QR'}
                      </button>
                      
                      <button
                        className="btn btn-sm btn-primary flex-fill"
                        onClick={() => {
                          setReservaSeleccionada(reserva);
                          if (reserva.id) {
                            void fetchQRForReserva(reserva.id);
                          }
                        }}
                      >
                        <i className="fas fa-info-circle me-1"></i>
                        Ver Detalle
                      </button>
                      
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

      {/* Modal de Detalle */}
      {reservaSeleccionada && (
        <ReservaDetailModal
          reserva={reservaSeleccionada}
          onClose={() => setReservaSeleccionada(null)}
          onCancelar={handleCancelarReserva}
          qrData={reservaSeleccionada.id ? qrCodes[reservaSeleccionada.id] : undefined}
          qrLoading={Boolean(reservaSeleccionada.id && qrLoadingIds[reservaSeleccionada.id])}
          qrError={reservaSeleccionada.id ? qrErrorIds[reservaSeleccionada.id] : undefined}
          onFetchQR={(id) => void fetchQRForReserva(id)}
        />
      )}
    </div>
  );
};

export default MisReservas;