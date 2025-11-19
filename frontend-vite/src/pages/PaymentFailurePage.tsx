import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Obtener parámetros de la URL
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const preferenceId = searchParams.get('preference_id');

    console.log('❌ Pago fallido - Payment ID:', paymentId);
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
                {/* Ícono de error */}
                <div className="mb-4">
                  <div 
                    className="rounded-circle d-inline-flex align-items-center justify-content-center"
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      backgroundColor: '#f8d7da',
                      border: '4px solid #dc3545'
                    }}
                  >
                    <i className="fa fa-times" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                  </div>
                </div>

                {/* Título */}
                <h1 className="display-5 mb-3 text-danger">
                  Pago No Completado
                </h1>

                {/* Descripción */}
                <p className="lead text-muted mb-4">
                  Lo sentimos, no pudimos procesar tu pago. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.
                </p>

                {/* Información adicional */}
                <div className="alert alert-warning" role="alert">
                  <i className="fa fa-exclamation-triangle me-2"></i>
                  <strong>Posibles causas:</strong>
                  <ul className="text-start mt-2 mb-0">
                    <li>Fondos insuficientes en tu cuenta</li>
                    <li>Datos de la tarjeta incorrectos</li>
                    <li>Límite de compra excedido</li>
                    <li>Rechazo por parte del banco emisor</li>
                  </ul>
                </div>

                {/* Detalles del intento */}
                {searchParams.get('payment_id') && (
                  <div className="text-start mb-4 p-3 bg-light rounded">
                    <p className="mb-2">
                      <strong>ID de Intento:</strong> <code>{searchParams.get('payment_id')}</code>
                    </p>
                    {searchParams.get('status') && (
                      <p className="mb-0">
                        <strong>Estado:</strong> <span className="badge bg-danger">{searchParams.get('status')}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="d-grid gap-3 d-md-flex justify-content-md-center mt-4">
                  <Link to="/carrito" className="btn btn-primary btn-lg">
                    <i className="fa fa-shopping-cart me-2"></i>
                    Volver al Carrito
                  </Link>
                  <Link to="/experiencias" className="btn btn-outline-secondary btn-lg">
                    <i className="fa fa-search me-2"></i>
                    Explorar Experiencias
                  </Link>
                </div>

                {/* Ayuda */}
                <div className="mt-4 pt-4 border-top">
                  <p className="text-muted mb-2">
                    <i className="fa fa-question-circle me-2"></i>
                    ¿Necesitas ayuda?
                  </p>
                  <a href="mailto:soporte@turisnow.com" className="text-decoration-none">
                    soporte@turisnow.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;



