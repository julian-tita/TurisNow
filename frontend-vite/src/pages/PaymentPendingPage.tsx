import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentPendingPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Obtener parámetros de la URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');

    console.log('⏳ Pago pendiente - Payment ID:', paymentId);
    console.log('📊 Status:', status);
    console.log('🆔 Preference ID:', preferenceId);
  }, [searchParams]);

  return (
    <div className="container-fluid py-5" style={{ paddingTop: '120px', minHeight: '80vh' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center p-5">
                {/* Ícono de pendiente */}
                <div className="mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: '#fff3cd',
                      border: '4px solid #ffc107'
                    }}
                  >
                    <i className="fa fa-clock" style={{ fontSize: '3rem', color: '#ffc107' }}></i>
                  </div>
                </div>

                {/* Título */}
                <h1 className="display-5 mb-3 text-warning">
                  Pago Pendiente
                </h1>

                {/* Descripción */}
                <p className="lead text-muted mb-4">
                  Tu pago está siendo procesado. Te notificaremos por email cuando se complete la transacción.
                </p>

                {/* Información adicional */}
                <div className="alert alert-info" role="alert">
                  <i className="fa fa-info-circle me-2"></i>
                  <strong>¿Qué significa esto?</strong>
                  <p className="mt-2 mb-0">
                    Dependiendo del método de pago seleccionado, la confirmación puede demorar entre minutos y días hábiles. 
                    Recibirás un email cuando tu pago sea confirmado.
                  </p>
                </div>

                {/* Casos comunes */}
                <div className="text-start mb-4 p-3 bg-light rounded">
                  <p className="mb-2"><strong>Métodos de pago que pueden quedar pendientes:</strong></p>
                  <ul className="mb-0">
                    <li>Transferencia bancaria</li>
                    <li>Depósito en efectivo (ej: RapiPago, PagoFácil)</li>
                    <li>Tarjetas de débito (en algunos casos)</li>
                  </ul>
                </div>

                {/* Detalles del pago */}
                {searchParams.get('payment_id') && (
                  <div className="text-start mb-4 p-3 bg-light rounded">
                    <p className="mb-2">
                      <strong>ID de Pago:</strong> <code>{searchParams.get('payment_id')}</code>
                    </p>
                    {searchParams.get('status') && (
                      <p className="mb-0">
                        <strong>Estado:</strong> <span className="badge bg-warning text-dark">{searchParams.get('status')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <Link to="/mis-reservas" className="btn btn-primary btn-lg">
                    <i className="fa fa-calendar me-2"></i>
                    Ver Mis Reservas
                  </Link>
                  <Link to="/experiencias" className="btn btn-outline-primary btn-lg">
                    <i className="fa fa-search me-2"></i>
                    Explorar Más Experiencias
                  </Link>
                </div>

                {/* Nota adicional */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted mb-2">
                    <i className="fa fa-envelope me-2"></i>
                    <strong>¿No recibiste el email?</strong>
                  </p>
                  <p className="text-muted small">
                    Revisa tu carpeta de spam o contacta a nuestro soporte en{' '}
                    <a href="mailto:soporte@turisnow.com" className="text-decoration-none">
                      soporte@turisnow.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;



