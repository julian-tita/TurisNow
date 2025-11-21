// TurisNow: Modal de detalle de reserva
import React from 'react';
import type { QRData, ReservaDetalleDTO } from '../../services/reservaService';

interface ReservaDetailModalProps {
  reserva: ReservaDetalleDTO | null;
  onClose: () => void;
  onConfirmar?: (reservaId: number) => void;
  onCancelar?: (reservaId: number) => void;
  qrData?: QRData | null;
  qrLoading?: boolean;
  qrError?: string | null;
  onFetchQR?: (reservaId: number) => void;
}

const ReservaDetailModal: React.FC<ReservaDetailModalProps> = ({
  reserva,
  onClose,
  onConfirmar,
  onCancelar,
  qrData,
  qrLoading,
  qrError,
  onFetchQR
}) => {
  if (!reserva) return null;

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { class: string; icon: string }> = {
      'PENDIENTE': { class: 'bg-warning text-dark', icon: 'clock' },
      'CONFIRMADA': { class: 'bg-success', icon: 'check-circle' },
      'CANCELADA': { class: 'bg-danger', icon: 'times-circle' },
      'COMPLETADA': { class: 'bg-info', icon: 'flag-checkered' },
      'PAGADA': { class: 'bg-primary', icon: 'credit-card' }
    };
    return badges[estado.toUpperCase()] || { class: 'bg-secondary', icon: 'question-circle' };
  };

  const estadoBadge = getEstadoBadge(reserva.estado);

  // Timeline de la reserva
  const getTimeline = () => {
    const items = [
      {
        fecha: reserva.fechaReserva,
        titulo: 'Reserva Creada',
        icon: 'calendar-plus',
        color: 'primary',
        activo: true
      }
    ];

    if (reserva.fechaConfirmacion) {
      items.push({
        fecha: reserva.fechaConfirmacion,
        titulo: 'Reserva Confirmada',
        icon: 'check-circle',
        color: 'success',
        activo: true
      });
    }

    if (reserva.fechaCancelacion) {
      items.push({
        fecha: reserva.fechaCancelacion,
        titulo: 'Reserva Cancelada',
        icon: 'times-circle',
        color: 'danger',
        activo: true
      });
    }

    if (reserva.estado === 'COMPLETADA') {
      items.push({
        fecha: reserva.fechaFin,
        titulo: 'Experiencia Completada',
        icon: 'flag-checkered',
        color: 'info',
        activo: true
      });
    }

    return items;
  };

  const timeline = getTimeline();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex={-1}
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header bg-light">
              <div>
                <h5 className="modal-title mb-1">
                  <i className="fas fa-file-invoice me-2 text-primary"></i>
                  Detalle de Reserva
                </h5>
                <small className="text-muted">ID: #{reserva.id}</small>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Estado de la Reserva */}
              <div className="alert alert-light border mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Estado de la Reserva</h6>
                    <span className={`badge ${estadoBadge.class} fs-6`}>
                      <i className={`fas fa-${estadoBadge.icon} me-1`}></i>
                      {reserva.estado}
                    </span>
                  </div>
                  <div className="text-end">
                    <small className="text-muted d-block">Fecha de reserva</small>
                    <strong>{formatDate(reserva.fechaReserva)}</strong>
                  </div>
                </div>
              </div>

              {/* Información de la Experiencia */}
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-map-marked-alt me-2"></i>
                    Información de la Experiencia
                  </h6>
                </div>
                <div className="card-body">
                  <h5 className="card-title text-primary mb-3">{reserva.tituloExperiencia}</h5>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <p className="mb-2">
                        <i className="fas fa-map-marker-alt text-danger me-2"></i>
                        <strong>Ubicación:</strong> {reserva.ciudadExperiencia}, {reserva.paisExperiencia}
                      </p>
                      <p className="mb-2">
                        <i className="fas fa-calendar-day text-success me-2"></i>
                        <strong>Fecha inicio:</strong> {formatDate(reserva.fechaInicio)}
                      </p>
                      {reserva.fechaFin && (
                        <p className="mb-2">
                          <i className="fas fa-calendar-check text-info me-2"></i>
                          <strong>Fecha fin:</strong> {formatDate(reserva.fechaFin)}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">
                        <i className="fas fa-users text-primary me-2"></i>
                        <strong>Personas:</strong> {reserva.cantidadPersonas}
                      </p>
                      <p className="mb-2">
                        <i className="fas fa-dollar-sign text-success me-2"></i>
                        <strong>Precio Total:</strong> {formatPrice(reserva.precioTotal)}
                      </p>
                      <p className="mb-0">
                        <i className="fas fa-ticket-alt text-warning me-2"></i>
                        <strong>ID Salida:</strong> #{reserva.salidaId}
                      </p>
                    </div>
                  </div>

                  {reserva.descripcionExperiencia && (
                    <div className="mt-3 pt-3 border-top">
                      <p className="text-muted mb-0">
                        <small>{reserva.descripcionExperiencia}</small>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {reserva.id && (
                <div className="card mb-4">
                  <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                      <i className="fas fa-qrcode me-2"></i>
                      Código QR de acceso
                    </h6>
                    {onFetchQR && (
                      <button
                        className="btn btn-sm btn-outline-light"
                        onClick={() => onFetchQR(reserva.id)}
                      >
                        Actualizar
                      </button>
                    )}
                  </div>
                  <div className="card-body text-center">
                    {qrLoading ? (
                      <div className="py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando código QR...</span>
                        </div>
                      </div>
                    ) : qrData ? (
                      <>
                        <img
                          src={qrData.qrCodeBase64.startsWith('data:')
                            ? qrData.qrCodeBase64
                            : `data:image/png;base64,${qrData.qrCodeBase64}`}
                          alt={`Código QR reserva ${reserva.id}`}
                          style={{ maxWidth: '240px', width: '100%' }}
                        />
                        <div className="mt-3">
                          <h6 className="text-muted mb-1">Token de verificación</h6>
                          <code className="d-inline-block px-3 py-2 bg-light rounded">
                            {qrData.tokenQr}
                          </code>
                        </div>
                      </>
                    ) : (
                      <div className="alert alert-light border" role="alert">
                        No pudimos cargar el código QR automáticamente. Usa el botón "Actualizar" para intentarlo nuevamente.
                      </div>
                    )}

                    {qrError && (
                      <div className="alert alert-warning mt-3 mb-0" role="alert">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {qrError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información del Usuario */}
              <div className="card mb-4">
                <div className="card-header bg-secondary text-white">
                  <h6 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Datos del Titular
                  </h6>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <i className="fas fa-user-circle text-primary me-2"></i>
                    <strong>Nombre:</strong> {reserva.nombreUsuario}
                  </p>
                  <p className="mb-0">
                    <i className="fas fa-envelope text-info me-2"></i>
                    <strong>Email:</strong> {reserva.emailUsuario}
                  </p>
                </div>
              </div>

              {/* Timeline de Estados */}
              {timeline.length > 1 && (
                <div className="card mb-4">
                  <div className="card-header bg-info text-white">
                    <h6 className="mb-0">
                      <i className="fas fa-history me-2"></i>
                      Historial de Estados
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="timeline">
                      {timeline.map((item, index) => (
                        <div key={index} className="timeline-item d-flex mb-3">
                          <div className={`timeline-icon text-${item.color}`}>
                            <i className={`fas fa-${item.icon}`}></i>
                          </div>
                          <div className="timeline-content ms-3">
                            <h6 className="mb-1">{item.titulo}</h6>
                            <small className="text-muted">{formatDateTime(item.fecha)}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {reserva.observaciones && (
                <div className="alert alert-warning">
                  <h6 className="alert-heading">
                    <i className="fas fa-info-circle me-2"></i>
                    Observaciones
                  </h6>
                  <p className="mb-0">{reserva.observaciones}</p>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="modal-footer bg-light">
              <div className="d-flex justify-content-between w-100">
                <div>
                  {reserva.estado === 'CONFIRMADA' && (
                    <button 
                      className="btn btn-outline-success me-2"
                      onClick={() => {
                        // Acción para descargar comprobante (por implementar)
                        alert('Descarga de comprobante - Por implementar');
                      }}
                    >
                      <i className="fas fa-download me-1"></i>
                      Descargar Comprobante
                    </button>
                  )}
                </div>
                <div>
                  {reserva.estado === 'PENDIENTE' && onConfirmar && (
                    <button 
                      className="btn btn-success me-2"
                      onClick={() => {
                        onConfirmar(reserva.id);
                        onClose();
                      }}
                    >
                      <i className="fas fa-check me-1"></i>
                      Confirmar Reserva
                    </button>
                  )}
                  
                  {(reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA') && onCancelar && (
                    <button 
                      className="btn btn-danger me-2"
                      onClick={() => {
                        onCancelar(reserva.id);
                        onClose();
                      }}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancelar Reserva
                    </button>
                  )}
                  
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={onClose}
                  >
                    <i className="fas fa-arrow-left me-1"></i>
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .timeline {
          position: relative;
        }
        .timeline-item {
          position: relative;
        }
        .timeline-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border: 2px solid currentColor;
          flex-shrink: 0;
        }
        .timeline-item:not(:last-child) .timeline-icon::after {
          content: '';
          position: absolute;
          left: 15px;
          top: 32px;
          width: 2px;
          height: 40px;
          background: #dee2e6;
        }
        .timeline-content {
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default ReservaDetailModal;
