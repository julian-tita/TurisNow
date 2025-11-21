import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import reservaService from '../services/reservaService';
import type { QRData, ReservaDetalleDTO } from '../services/reservaService';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [reservasRecientes, setReservasRecientes] = useState<ReservaDetalleDTO[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<number, QRData>>({});
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    // Obtener parámetros de la URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');
    const merchantOrderId = searchParams.get('merchant_order_id');

    console.log('✅ Pago exitoso - Payment ID:', paymentId);
    console.log('📊 Status:', status);
    console.log('🆔 Preference ID:', preferenceId);
    console.log('🆔 Merchant Order ID:', merchantOrderId);

    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  useEffect(() => {
    const cargarReservasRecientes = async () => {
      if (!user) {
        setReservasRecientes([]);
        setQrCodes({});
        return;
      }

      try {
        setQrLoading(true);
        setQrError(null);

        const respuesta = await reservaService.obtenerMisReservas(0, 20);
        const reservasDisponibles = Array.isArray(respuesta.content)
          ? [...respuesta.content]
          : [];

        if (reservasDisponibles.length === 0) {
          setReservasRecientes([]);
          setQrCodes({});
          return;
        }

        reservasDisponibles.sort((a, b) => {
          const fechaA = a.fechaReserva ? new Date(a.fechaReserva).getTime() : 0;
          const fechaB = b.fechaReserva ? new Date(b.fechaReserva).getTime() : 0;
          return fechaB - fechaA;
        });

        const ahora = Date.now();
        const recientes = reservasDisponibles.filter((reserva) => {
          if (!reserva.fechaReserva) {
            return false;
          }
          const diferenciaHoras = (ahora - new Date(reserva.fechaReserva).getTime()) / (1000 * 60 * 60);
          return diferenciaHoras <= 48;
        }).slice(0, 3);

        const seleccionadas = recientes.length > 0
          ? recientes
          : reservasDisponibles.slice(0, Math.min(3, reservasDisponibles.length));

        setReservasRecientes(seleccionadas);

        const qrEntries = await Promise.all(
          seleccionadas.map(async (reserva) => {
            if (!reserva.id) {
              return null;
            }
            try {
              const qr = await reservaService.obtenerQRReserva(reserva.id);
              return [reserva.id, qr] as [number, QRData];
            } catch (error) {
              console.error('Error al obtener QR de la reserva', reserva.id, error);
              return null;
            }
          })
        );

        const qrMap: Record<number, QRData> = {};
        qrEntries.forEach((entry) => {
          if (entry) {
            const [reservaId, qr] = entry;
            qrMap[reservaId] = qr;
          }
        });

        setQrCodes(qrMap);
      } catch (error) {
        console.error('Error al cargar reservas recientes luego del pago', error);
        setQrError('No pudimos mostrar los códigos QR automáticamente. Podés verlos en la sección Mis Reservas.');
      } finally {
        setQrLoading(false);
      }
    };

    if (!loading) {
      void cargarReservasRecientes();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="container-fluid py-5" style={{ paddingTop: '120px', minHeight: '80vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 text-center">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Procesando tu pago...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center p-5">
                {/* Ícono de éxito */}
                <div className="mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: '#d4edda',
                      border: '4px solid #28a745'
                    }}
                  >
                    <i className="fa fa-check" style={{ fontSize: '3rem', color: '#28a745' }}></i>
                  </div>
                </div>

                {/* Título */}
                <h1 className="display-5 mb-3 text-success">
                  ¡Pago Exitoso!
                </h1>

                {/* Descripción */}
                <p className="lead text-muted mb-4">
                  Tu pago ha sido procesado correctamente. Recibirás un email de confirmación con los detalles de tu reserva.
                </p>

                {/* Información adicional */}
                <div className="alert alert-info" role="alert">
                  <i className="fa fa-info-circle me-2"></i>
                  <strong>¿Qué sigue?</strong> Tus reservas han sido confirmadas y ya puedes verlas en tu perfil.
                </div>

                {/* Detalles del pago */}
                {searchParams.get('payment_id') && (
                  <div className="text-start mb-4 p-3 bg-light rounded">
                    <p className="mb-2">
                      <strong>ID de Pago:</strong> <code>{searchParams.get('payment_id')}</code>
                    </p>
                    {searchParams.get('merchant_order_id') && (
                      <p className="mb-0">
                        <strong>ID de Orden:</strong> <code>{searchParams.get('merchant_order_id')}</code>
                      </p>
                    )}
                  </div>
                )}

                {user && (
                  <div className="mt-5 text-start">
                    <h4 className="mb-3 text-primary">
                      <i className="fa fa-qrcode me-2"></i>
                      Tus códigos QR
                    </h4>
                    <p className="text-muted mb-4">
                      Guardá estos códigos para presentarlos el día de tu experiencia. También podés verlos desde la sección Mis Reservas.
                    </p>

                    {qrLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando códigos QR...</span>
                        </div>
                      </div>
                    ) : reservasRecientes.length === 0 ? (
                      <div className="alert alert-light border text-muted" role="alert">
                        No encontramos reservas recientes asociadas a este pago. Podés revisarlas en Mis Reservas.
                      </div>
                    ) : (
                      <div className="row g-4">
                        {reservasRecientes.map((reserva) => {
                          const qrData = reserva.id ? qrCodes[reserva.id] : undefined;
                          const qrSrc = qrData
                            ? qrData.qrCodeBase64.startsWith('data:')
                              ? qrData.qrCodeBase64
                              : `data:image/png;base64,${qrData.qrCodeBase64}`
                            : '';
                          const ubicacion = [reserva.ciudadExperiencia, reserva.paisExperiencia]
                            .filter(Boolean)
                            .join(', ') || 'Ubicación a confirmar';

                          return (
                            <div key={reserva.id ?? reserva.tituloExperiencia} className="col-md-6">
                              <div className="border rounded p-4 h-100">
                                <h5 className="text-primary mb-2">{reserva.tituloExperiencia}</h5>
                                <p className="text-muted mb-1">
                                  <i className="fa fa-calendar me-1"></i>
                                  {reserva.fechaInicio
                                    ? new Date(reserva.fechaInicio).toLocaleString('es-AR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'Fecha a confirmar'}
                                </p>
                                <p className="text-muted mb-3">
                                  <i className="fa fa-map-marker-alt me-1"></i>
                                  {ubicacion}
                                </p>

                                {qrData ? (
                                  <div className="text-center">
                                    <img
                                      src={qrSrc}
                                      alt={`Código QR de la reserva ${reserva.id}`}
                                      style={{ maxWidth: '220px', width: '100%' }}
                                    />
                                    <small className="d-block text-muted mt-2">
                                      Código: {qrData.tokenQr}
                                    </small>
                                  </div>
                                ) : (
                                  <div className="alert alert-warning text-center mb-0" role="alert">
                                    <small>No pudimos mostrar el QR automáticamente. Revisa Mis Reservas para descargarlo.</small>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {qrError && (
                      <div className="alert alert-warning mt-4" role="alert">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        {qrError}
                      </div>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <Link to="/mis-reservas" className="btn btn-primary btn-lg">
                    <i className="fa fa-calendar-check me-2"></i>
                    Ver Mis Reservas
                  </Link>
                  <Link to="/experiencias" className="btn btn-outline-primary btn-lg">
                    <i className="fa fa-search me-2"></i>
                    Explorar Más Experiencias
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;



