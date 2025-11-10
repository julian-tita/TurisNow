// TurisNow: Componente de confirmación de reserva - Pantalla de éxito
import React from 'react';
import { useNavigate } from 'react-router-dom';

export type EstadoReserva = 'CONFIRMADA' | 'PENDIENTE' | 'CANCELADA' | 'PAGADA' | 'COMPLETADA';

export interface ReservaConfirmacionData {
  id: number;
  estado: EstadoReserva;
  total: number;
  moneda?: string; // 'ARS' | 'USD' ...
  fechaReserva: string; // ISO
  metodoPago?: string;
  experienciaTitulo?: string;
  fechaInicio?: string; // ISO
  fechaFin?: string; // ISO
  cantidadPersonas?: number;
  emailUsuario?: string;
}

const formatPrice = (value: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency, 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('es-AR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  }) : '';

const badgeByEstado = (estado: EstadoReserva) =>
  estado === 'CONFIRMADA' ? 'success' :
  estado === 'PENDIENTE' ? 'warning text-dark' :
  estado === 'CANCELADA' ? 'danger' :
  estado === 'COMPLETADA' ? 'info' : 'primary';

interface ReservaConfirmacionProps {
  data: ReservaConfirmacionData;
  onDescargarComprobante?: () => void;
}

const ReservaConfirmacion: React.FC<ReservaConfirmacionProps> = ({ 
  data, 
  onDescargarComprobante 
}) => {
  const navigate = useNavigate();
  const isConfirmada = data.estado === 'CONFIRMADA';

  return (
    <div className="card shadow-sm border-0 rounded-4">
      <div className="card-body p-4 p-lg-5">
        {/* Header de éxito */}
        <div className="d-flex align-items-center mb-4">
          <div 
            className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3"
            style={{ width: 56, height: 56 }}
          >
            <i className="fas fa-check fa-lg"></i>
          </div>
          <div className="flex-grow-1">
            <h2 className="h4 mb-1">
              {isConfirmada 
                ? '¡Gracias! Tu reserva está confirmada.' 
                : '¡Gracias! Tu reserva quedó pendiente.'}
            </h2>
            <p className="text-muted mb-0">
              Te enviaremos un correo con el resumen y los detalles de tu compra.
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="row g-4">
          <div className="col-12 col-lg-7">
            <div className="border rounded-3 p-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">N.º de reserva</span>
                <strong className="text-primary">#{data.id}</strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Estado</span>
                <span className={`badge bg-${badgeByEstado(data.estado)}`}>
                  {data.estado}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Total pagado</span>
                <strong className="h5 mb-0">
                  {formatPrice(data.total, data.moneda || 'ARS')}
                </strong>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">Fecha de reserva</span>
                <strong>{formatDate(data.fechaReserva)}</strong>
              </div>

              {!!data.metodoPago && (
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Método de pago</span>
                  <strong>{data.metodoPago}</strong>
                </div>
              )}

              {data.experienciaTitulo && (
                <>
                  <hr className="my-3" />
                  <div>
                    <div className="fw-semibold text-primary mb-2">
                      <i className="fas fa-map-marked-alt me-2"></i>
                      {data.experienciaTitulo}
                    </div>
                    <div className="small text-muted">
                      {data.fechaInicio && (
                        <>
                          <i className="fas fa-calendar-day me-1"></i>
                          Inicio: {formatDate(data.fechaInicio)}
                        </>
                      )}
                      {data.fechaFin && (
                        <>
                          {' · '}
                          <i className="fas fa-calendar-check me-1"></i>
                          Fin: {formatDate(data.fechaFin)}
                        </>
                      )}
                      {typeof data.cantidadPersonas === 'number' && (
                        <>
                          {' · '}
                          <i className="fas fa-users me-1"></i>
                          Personas: {data.cantidadPersonas}
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Siguiente pasos + acciones */}
          <div className="col-12 col-lg-5">
            <div className="border rounded-3 p-3 h-100 d-flex flex-column">
              <h6 className="mb-3">
                <i className="fas fa-info-circle text-primary me-2"></i>
                ¿Qué sigue?
              </h6>
              <ul className="list-unstyled small text-muted mb-4">
                <li className="mb-2">
                  <i className="fas fa-envelope me-2 text-primary"></i>
                  Recibirás un email con el comprobante y los datos de tu reserva.
                </li>
                <li className="mb-2">
                  <i className="fas fa-user-clock me-2 text-primary"></i>
                  Podrás ver y gestionar tu reserva desde "Mi Perfil › Mis Reservas".
                </li>
                <li className="mb-0">
                  <i className="fas fa-undo me-2 text-primary"></i>
                  Cambios o cancelaciones según política vigente.
                </li>
              </ul>

              <div className="mt-auto d-flex flex-column gap-2">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate('/perfil?tab=reservas')}
                >
                  <i className="fas fa-list me-2"></i>
                  Ver mis reservas
                </button>

                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate('/')}
                >
                  <i className="fas fa-home me-2"></i>
                  Volver al inicio
                </button>

                {isConfirmada && onDescargarComprobante && (
                  <button 
                    className="btn btn-outline-success w-100" 
                    onClick={onDescargarComprobante}
                  >
                    <i className="fas fa-download me-2"></i>
                    Descargar comprobante
                  </button>
                )}
              </div>

              {data.emailUsuario && (
                <div className="mt-3 p-2 bg-light rounded small text-center">
                  <i className="fas fa-envelope me-1 text-muted"></i>
                  Enviaremos el correo a: <strong>{data.emailUsuario}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservaConfirmacion;
