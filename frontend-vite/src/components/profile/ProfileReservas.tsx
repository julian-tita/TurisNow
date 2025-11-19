// filepath: frontend-vite/src/components/profile/ProfileReservas.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import reservaService, { type ReservaDetalleDTO, type QRData } from '../../services/reservaService';
import QRModal from '../reservas/QRModal';

const ProfileReservas: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaDetalleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  
  // Estados para el modal de QR
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loadingQR, setLoadingQR] = useState(false);

  const cargarReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservaService.obtenerMisReservas(0, 100, filtroEstado);
      setReservas(response.content || []);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Error al cargar las reservas';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReservas();
  }, [filtroEstado]);

  const handleVerQR = async (reservaId: number) => {
    setLoadingQR(true);
    try {
      const data = await reservaService.obtenerQRReserva(reservaId);
      setQrData(data);
      setShowQRModal(true);
    } catch (e: any) {
      const errorMsg = e?.message || 'Error al obtener el código QR';
      toast.error(errorMsg);
    } finally {
      setLoadingQR(false);
    }
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setQrData(null);
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado?.toUpperCase()) {
      case 'CONFIRMADA':
        return 'bg-success';
      case 'PENDIENTE':
        return 'bg-warning text-dark';
      case 'CANCELADA':
        return 'bg-danger';
      case 'COMPLETADA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatFecha = (fecha: string) => {
    if (!fecha) return '';
    try {
      return new Date(fecha).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return (
      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Mis Reservas</h5>
        <div className="placeholder-glow">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card mb-3">
              <div className="card-body">
                <span className="placeholder col-7 mb-2"></span>
                <span className="placeholder col-5 mb-2"></span>
                <span className="placeholder col-6"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Mis Reservas</h5>
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <span>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </span>
          <button className="btn btn-sm btn-outline-danger" onClick={cargarReservas}>
            <i className="fas fa-sync-alt me-1"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
               style={{ width: '50px', height: '50px' }}>
            <i className="fas fa-calendar-check text-white" style={{ fontSize: '1.5rem' }}></i>
          </div>
          <div>
            <h5 className="mb-1">Mis Reservas</h5>
            <p className="text-muted mb-0">
              {reservas.length === 0 
                ? 'No tienes reservas' 
                : `${reservas.length} reserva${reservas.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>
        </div>

        {/* Filtro por estado */}
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '4rem' }}></i>
          <p className="text-muted mb-3">
            {filtroEstado 
              ? `No tienes reservas ${filtroEstado.toLowerCase()}` 
              : 'No tienes reservas aún'
            }
          </p>
          <p className="text-muted mb-4">
            Explora nuestras experiencias y reserva tu próxima aventura
          </p>
          <Link to="/experiencias" className="btn btn-primary">
            <i className="fas fa-search me-2"></i>
            Explorar Experiencias
          </Link>
        </div>
      ) : (
        <div className="list-group">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="list-group-item list-group-item-action mb-2 border rounded">
              <div className="d-flex w-100 justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <h6 className="mb-0 me-3">
                      {reserva.tituloExperiencia}
                    </h6>
                    <span className={`badge ${getEstadoBadgeClass(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>

                  <div className="row g-2 mt-2">
                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {reserva.ciudadExperiencia}, {reserva.paisExperiencia}
                      </small>
                    </div>

                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block">
                        <i className="fas fa-calendar me-2"></i>
                        {formatFecha(reserva.fechaInicio)}
                        {reserva.fechaFin && reserva.fechaFin !== reserva.fechaInicio && 
                          ` - ${formatFecha(reserva.fechaFin)}`
                        }
                      </small>
                    </div>

                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block">
                        <i className="fas fa-users me-2"></i>
                        {reserva.cantidadPersonas} persona{reserva.cantidadPersonas !== 1 ? 's' : ''}
                      </small>
                    </div>

                    <div className="col-12 col-md-6">
                      <small className="text-muted d-block">
                        <i className="fas fa-clock me-2"></i>
                        Reservado: {formatFecha(reserva.fechaReserva)}
                      </small>
                    </div>
                  </div>

                  {reserva.observaciones && (
                    <div className="mt-2">
                      <small className="text-muted fst-italic">
                        <i className="fas fa-comment me-2"></i>
                        {reserva.observaciones}
                      </small>
                    </div>
                  )}

                  {/* Badge de Check-in */}
                  {reserva.checkinRealizado && (
                    <div className="mt-2">
                      <span className="badge bg-success">
                        <i className="fas fa-check-circle me-1"></i>
                        Check-in Realizado
                      </span>
                    </div>
                  )}
                </div>

                <div className="ms-3 text-end">
                  <div className="mb-2">
                    <strong className="text-primary fs-5">
                      ${reserva.precioTotal.toLocaleString()}
                    </strong>
                  </div>
                  <small className="text-muted d-block mb-2">
                    ID: #{reserva.id}
                  </small>
                  
                  {/* Botón Ver QR - Solo si la reserva está confirmada y tiene token */}
                  {reserva.tokenQr && reserva.estado === 'Confirmada' && (
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => handleVerQR(reserva.id)}
                      disabled={loadingQR}
                    >
                      {loadingQR ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Cargando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-qrcode me-1"></i>
                          Ver QR
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de QR */}
      {showQRModal && qrData && (
        <QRModal qrData={qrData} onClose={closeQRModal} />
      )}
    </div>
  );
};

export default ProfileReservas;
