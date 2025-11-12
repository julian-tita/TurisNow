import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

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



