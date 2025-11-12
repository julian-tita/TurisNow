// TurisNow: Reservation Checkout Page - Mercado Libre Style with 5 Steps
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import experienciaService from '../services/experienciaService';
import reservaService from '../services/reservaService';
import pagoService from '../services/pagoService';
import userService from '../services/userService';
import ReservaConfirmacion from '../components/reservas/ReservaConfirmacion';
import type { ExperienciaDetalleDTO } from '../types/experiencia.types';
import type { ReservaRequest } from '../services/reservaService';

const ReservarExperiencia: React.FC = () => {
  const { experienciaId, salidaId } = useParams<{ 
    experienciaId: string; 
    salidaId: string; 
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estado de la página
  const [experiencia, setExperiencia] = useState<ExperienciaDetalleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Datos de la reserva
  const [reservaData, setReservaData] = useState({
    cantidadPersonas: 1,
    observaciones: '',
    nombre: user?.nombreCompleto || '',
    email: user?.email || '',
    telefono: '',
    documentoIdentidad: ''
  });

  // Datos de pago
  const [pagoData, setPagoData] = useState({
    metodoPago: '', // 'tarjeta', 'transferencia', 'efectivo'
    numeroTarjeta: '',
    nombreTitular: '',
    fechaVencimiento: '',
    codigoSeguridad: '',
    cuotas: 1,
    aceptaTerminos: false
  });

  // Estados para el paso 5 (Confirmación final)
  const [processingPayment, setProcessingPayment] = useState(false);
  const [reservaCreada, setReservaCreada] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Estado de validaciones
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Cargar datos de la experiencia al montar
  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          redirectUrl: `/reservar/${experienciaId}/${salidaId}` 
        } 
      });
      return;
    }

    if (experienciaId && salidaId) {
      loadExperienciaData();
      loadUserData();
    }
  }, [experienciaId, salidaId, user, navigate]);

  const loadUserData = async () => {
    try {
      const userData = await userService.getMe();
      
      // Actualizar los datos del formulario con la información del usuario
      setReservaData(prev => ({
        ...prev,
        nombre: userData.nombreCompleto || `${userData.nombre} ${userData.apellido}`,
        email: userData.email,
        telefono: userData.telefono || '',
        documentoIdentidad: userData.documento || ''
      }));
    } catch (err: any) {
      console.error('Error al cargar datos del usuario:', err);
      // No mostrar error toast, solo log - los campos quedarán vacíos para que el usuario los complete
    }
  };

  const loadExperienciaData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await experienciaService.getExperienciaById(parseInt(experienciaId!));
      setExperiencia(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al cargar la experiencia';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Datos calculados
  const salidaSeleccionada = experiencia?.salidas?.find(
    s => s.id === parseInt(salidaId!)
  );
  const precioTotal = experiencia && reservaData.cantidadPersonas 
    ? experiencia.precio * reservaData.cantidadPersonas 
    : 0;

  const formatPrice = (precio: number) => {
    return experiencia 
      ? reservaService.formatearPrecio(precio, experiencia.moneda)
      : '';
  };

  const validateCurrentStep = (): boolean => {
    const errors: string[] = [];

    if (step === 1) {
      // Validar cantidad
      if (reservaData.cantidadPersonas < 1) {
        errors.push('La cantidad debe ser mayor a 0');
      }
      
      if (salidaSeleccionada && reservaData.cantidadPersonas > salidaSeleccionada.capacidadDisponible) {
        errors.push(`Solo hay ${salidaSeleccionada.capacidadDisponible} cupos disponibles`);
      }
    } else if (step === 2) {
      // Validar datos personales
      if (!reservaData.nombre.trim()) {
        errors.push('El nombre es obligatorio');
      }
      
      if (!reservaData.email.trim()) {
        errors.push('El email es obligatorio');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservaData.email)) {
        errors.push('El email no es válido');
      }
      
      if (!reservaData.telefono.trim()) {
        errors.push('El teléfono es obligatorio');
      }
    } else if (step === 4) {
      // Validar aceptación de términos
      if (!pagoData.aceptaTerminos) {
        errors.push('Debe aceptar los términos y condiciones para continuar');
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const goToNextStep = () => {
    if (validateCurrentStep()) {
      if (step === 4) {
        // Del paso 4 (Pago) ir directamente al procesamiento
        procesarReserva();
      } else {
        setStep(s => Math.min(5, s + 1));
      }
    }
  };

  const goToPrevStep = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const procesarReserva = async () => {
    if (!validateCurrentStep() || !experiencia || !salidaSeleccionada) {
      return;
    }

     // Confirmar que el usuario quiere proceder al pago
    if (!window.confirm('Serás redirigido a Mercado Pago para completar tu pago de forma segura. ¿Continuar?')) {
      return;
    }

    setProcessingPayment(true);
    setPaymentError(null);

    try {
      console.log('💳 Iniciando checkout directo con Mercado Pago...');
      
      // Crear preferencia de pago en Mercado Pago
      const response = await pagoService.procesarCheckoutDirecto({
        salidaId: parseInt(salidaId!),
        cantidad: reservaData.cantidadPersonas,
        observaciones: reservaData.observaciones || undefined
      });

      if (response && response.success && response.initPoint) {
        console.log('🚀 Redirigiendo a Mercado Pago:', response.initPoint);
        
        // Guardar datos en localStorage por si el usuario vuelve
        localStorage.setItem('reservation.pending', JSON.stringify({
          experienciaId,
          salidaId,
          cantidad: reservaData.cantidadPersonas,
          pagoId: response.pagoId,
          fecha: new Date().toISOString()
        }));
        
        // Mostrar toast antes de redirigir
        toast.success('Redirigiendo a Mercado Pago...');
        
        // Redirigir a Mercado Pago
        setTimeout(() => {
          window.location.href = response.initPoint!;
        }, 500);
      } else {
        throw new Error(response.message || 'No se pudo crear la preferencia de pago');
      }

    } catch (err: any) {
      const errorMsg = err.message || 'Error al procesar el pago. Por favor, intenta nuevamente.';
      setPaymentError(errorMsg);
      toast.error(errorMsg);
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando información de la experiencia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !experiencia || !salidaSeleccionada) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
            <h3 className="mt-3 text-danger">Error</h3>
            <p className="text-muted">{error || 'No se pudo cargar la información'}</p>
            <Link to={`/experiencias/${experienciaId}`} className="btn btn-primary">
              Volver a la experiencia
            </Link>
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
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/experiencias">Experiencias</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/experiencias/${experienciaId}`}>{experiencia.titulo}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Reservar
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Progress Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="row align-items-center">
                <div className="col text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className={`checkout-step-number ${step >= 1 ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                      {step > 1 ? <i className="fas fa-check"></i> : '1'}
                    </div>
                    <small className="mt-2">Detalles</small>
                  </div>
                </div>
                <div className="col text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className={`checkout-step-number ${step >= 2 ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                      {step > 2 ? <i className="fas fa-check"></i> : '2'}
                    </div>
                    <small className="mt-2">Tus datos</small>
                  </div>
                </div>
                <div className="col text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className={`checkout-step-number ${step >= 3 ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                      {step > 3 ? <i className="fas fa-check"></i> : '3'}
                    </div>
                    <small className="mt-2">Confirmar</small>
                  </div>
                </div>
                <div className="col text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className={`checkout-step-number ${step >= 4 ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                      {step > 4 ? <i className="fas fa-check"></i> : '4'}
                    </div>
                    <small className="mt-2">Pago</small>
                  </div>
                </div>
                <div className="col text-center">
                  <div className="d-flex flex-column align-items-center">
                    <div className={`checkout-step-number ${step >= 5 ? 'bg-white text-primary' : 'bg-light text-muted'}`}>
                      {step >= 5 ? <i className="fas fa-check"></i> : '5'}
                    </div>
                    <small className="mt-2">Completar</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {/* Step 1: Detalles de la reserva */}
              {step === 1 && (
                <div>
                  <h5 className="card-title mb-4">
                    <i className="fas fa-users text-primary me-2"></i>
                    Detalles de la reserva
                  </h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-medium">Cantidad de personas</label>
                      <div className="input-group" style={{ maxWidth: '200px' }}>
                        <button 
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={() => setReservaData(prev => ({ 
                            ...prev, 
                            cantidadPersonas: Math.max(1, prev.cantidadPersonas - 1) 
                          }))}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <input 
                          type="number" 
                          className="form-control text-center"
                          value={reservaData.cantidadPersonas}
                          onChange={(e) => setReservaData(prev => ({ 
                            ...prev, 
                            cantidadPersonas: Math.max(1, parseInt(e.target.value) || 1) 
                          }))}
                          min="1"
                          max={salidaSeleccionada?.capacidadDisponible || 10}
                        />
                        <button 
                          className="btn btn-outline-primary"
                          type="button"
                          onClick={() => setReservaData(prev => ({ 
                            ...prev, 
                            cantidadPersonas: Math.min(
                              salidaSeleccionada?.capacidadDisponible || 10, 
                              prev.cantidadPersonas + 1
                            ) 
                          }))}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <small className="text-muted">
                        Máximo {salidaSeleccionada?.capacidadDisponible || 0} personas disponibles
                      </small>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-medium">
                        <i className="fas fa-comment text-secondary me-2"></i>
                        Observaciones (opcional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={reservaData.observaciones}
                        onChange={(e) => setReservaData(prev => ({ 
                          ...prev, 
                          observaciones: e.target.value 
                        }))}
                        placeholder="Algún comentario especial, requerimiento dietético, etc."
                        maxLength={500}
                      />
                      <small className="text-muted">
                        {reservaData.observaciones.length}/500 caracteres
                      </small>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Información importante:</strong> Esta reserva está sujeta a confirmación 
                    y disponibilidad. Te contactaremos para confirmar todos los detalles.
                  </div>
                </div>
              )}

              {/* Step 2: Datos personales */}
              {step === 2 && (
                <div>
                  <h5 className="card-title mb-4">
                    <i className="fas fa-user text-primary me-2"></i>
                    Datos de contacto
                  </h5>

                  <div className="alert alert-success mb-4">
                    <i className="fas fa-check-circle me-2"></i>
                    <strong>Datos cargados desde tu perfil.</strong> Puedes revisarlos y editarlos si es necesario.
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-user text-secondary me-2"></i>
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={reservaData.nombre}
                        onChange={(e) => setReservaData(prev => ({ 
                          ...prev, 
                          nombre: e.target.value 
                        }))}
                        placeholder="Tu nombre y apellido"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-envelope text-secondary me-2"></i>
                        Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={reservaData.email}
                        onChange={(e) => setReservaData(prev => ({ 
                          ...prev, 
                          email: e.target.value 
                        }))}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-phone text-secondary me-2"></i>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={reservaData.telefono}
                        onChange={(e) => setReservaData(prev => ({ 
                          ...prev, 
                          telefono: e.target.value 
                        }))}
                        placeholder="+54 9 11 1234-5678"
                      />
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Cargado desde tu perfil - puedes editarlo
                      </small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-medium">
                        <i className="fas fa-id-card text-secondary me-2"></i>
                        Documento de identidad (opcional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={reservaData.documentoIdentidad}
                        onChange={(e) => setReservaData(prev => ({ 
                          ...prev, 
                          documentoIdentidad: e.target.value 
                        }))}
                        placeholder="DNI, Pasaporte, etc."
                      />
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Cargado desde tu perfil - puedes editarlo
                      </small>
                    </div>
                  </div>

                  <div className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Importante:</strong> Estos datos serán utilizados para contactarte 
                    y confirmar tu reserva.
                  </div>
                </div>
              )}

              {/* Step 3: Confirmación */}
              {step === 3 && (
                <div>
                  <h5 className="card-title mb-4">
                    <i className="fas fa-check-circle text-primary me-2"></i>
                    Confirmar reserva
                  </h5>

                  <div className="row g-3">
                    <div className="col-12">
                      <div className="alert alert-success">
                        <h6 className="alert-heading">
                          <i className="fas fa-info-circle me-2"></i>
                          Resumen de tu reserva
                        </h6>
                        <hr />
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Personas:</strong> {reservaData.cantidadPersonas}</p>
                            <p><strong>Nombre:</strong> {reservaData.nombre}</p>
                            <p><strong>Email:</strong> {reservaData.email}</p>
                            <p><strong>Teléfono:</strong> {reservaData.telefono}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Precio por persona:</strong> {formatPrice(experiencia.precio)}</p>
                            <p><strong>Total:</strong> <span className="h5 text-primary">{formatPrice(precioTotal)}</span></p>
                            {reservaData.observaciones && (
                              <p><strong>Observaciones:</strong> {reservaData.observaciones}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    <strong>Políticas de cancelación:</strong>
                    <ul className="mb-0 mt-2">
                      <li>Cancelación gratuita hasta 24 horas antes</li>
                      <li>Reembolso del 100% si cancelas con más de 24hs</li>
                      <li>Soporte disponible 24/7 para cualquier consulta</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 4: Pago */}
              {step === 4 && (
                <div>
                  <h5 className="card-title mb-4">
                    <i className="fas fa-credit-card text-primary me-2"></i>
                    Método de pago
                  </h5>

                  <div className="row g-3">
                    {/* Información de Mercado Pago */}
                    <div className="col-12">
                      <div className="alert alert-primary d-flex align-items-center" role="alert">
                        <i className="fas fa-info-circle fa-2x me-3"></i>
                        <div>
                          <h6 className="alert-heading mb-1">Pago seguro con Mercado Pago</h6>
                          <p className="mb-0">
                            Serás redirigido a Mercado Pago para completar tu pago de forma segura.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Métodos de pago disponibles en Mercado Pago */}
                    <div className="col-12">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title mb-3">
                            <i className="fas fa-credit-card me-2"></i>
                            Métodos de pago disponibles
                          </h6>
                          <div className="row g-3">
                            <div className="col-md-4">
                              <div className="text-center p-3 border rounded">
                                <i className="fas fa-credit-card fa-2x text-primary mb-2"></i>
                                <h6 className="mb-1">Tarjetas</h6>
                                <small className="text-muted">Crédito y débito</small>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-center p-3 border rounded">
                                <i className="fas fa-money-bill-wave fa-2x text-success mb-2"></i>
                                <h6 className="mb-1">Efectivo</h6>
                                <small className="text-muted">Rapipago, Pago Fácil</small>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="text-center p-3 border rounded">
                                <i className="fas fa-university fa-2x text-info mb-2"></i>
                                <h6 className="mb-1">Transferencia</h6>
                                <small className="text-muted">Débito automático</small>
                              </div>
                            </div>
                          </div>
                          <div className="text-center mt-3">
                            <img 
                              src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
                              alt="Mercado Pago" 
                              style={{ height: '32px' }}
                            />
                            <p className="text-muted small mt-2 mb-0">
                              <i className="fas fa-lock me-1"></i>
                              Tus datos están protegidos por Mercado Pago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumen del pago */}
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Total a pagar</h6>
                              <small className="text-muted">Se procesará al confirmar</small>
                            </div>
                            <h4 className="mb-0 text-primary">
                              {formatPrice(precioTotal)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Términos y condiciones */}
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="aceptaTerminos"
                          checked={pagoData.aceptaTerminos}
                          onChange={(e) => setPagoData(prev => ({ 
                            ...prev, 
                            aceptaTerminos: e.target.checked 
                          }))}
                        />
                        <label className="form-check-label" htmlFor="aceptaTerminos">
                          Acepto los <a href="#" className="text-primary">términos y condiciones</a> y las <a href="#" className="text-primary">políticas de privacidad</a>
                        </label>
                      </div>
                    </div>

                    {/* Resumen final */}
                    <div className="col-12">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">Total a pagar</h6>
                              <small>Incluye todos los impuestos</small>
                            </div>
                            <h4 className="mb-0">{formatPrice(precioTotal)}</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmación Final */}
              {step === 5 && (
                <div>
                  <div className="text-center">
                    <div className="mb-4">
                      {processingPayment ? (
                        <div>
                          <div className="spinner-border text-primary mb-3" style={{ width: '4rem', height: '4rem' }} role="status">
                            <span className="visually-hidden">Procesando...</span>
                          </div>
                          <h4 className="text-primary mb-3">Procesando tu reserva</h4>
                          <p className="text-muted">Estamos validando tu pago y creando tu reserva...</p>
                        </div>
                      ) : reservaCreada ? (
                        // Componente de confirmación profesional
                        <ReservaConfirmacion
                          data={{
                            id: reservaCreada.id,
                            estado: reservaCreada.estado,
                            total: precioTotal,
                            moneda: experiencia?.moneda || 'ARS',
                            fechaReserva: new Date().toISOString(),
                            metodoPago: 'Mercado Pago',
                            experienciaTitulo: experiencia?.titulo,
                            fechaInicio: salidaSeleccionada?.fechaInicio,
                            fechaFin: salidaSeleccionada?.fechaFin,
                            cantidadPersonas: reservaData.cantidadPersonas,
                            emailUsuario: reservaData.email
                          }}
                          onDescargarComprobante={() => {
                            // TODO: Implementar descarga de comprobante
                            toast.success('Función de descarga disponible próximamente');
                          }}
                        />
                      ) : paymentError && (
                        <div>
                          <i className="fas fa-exclamation-triangle text-danger mb-3" style={{ fontSize: '4rem' }}></i>
                          <h4 className="text-danger mb-3">Error en el procesamiento</h4>
                        </div>
                      )}
                    </div>

                    {/* Error en el procesamiento */}
                    {paymentError && (
                      <div className="row justify-content-center">
                        <div className="col-md-8">
                          <div className="alert alert-danger">
                            <h5 className="alert-heading">
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              No pudimos procesar tu reserva
                            </h5>
                            <hr />
                            <p className="mb-3">{paymentError}</p>
                            <div className="d-flex gap-2 justify-content-center">
                              <button 
                                className="btn btn-danger"
                                onClick={() => {
                                  setStep(4);
                                  setPaymentError(null);
                                }}
                              >
                                <i className="fas fa-arrow-left me-2"></i>
                                Intentar nuevamente
                              </button>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => navigate(`/experiencias/${experienciaId}`)}
                              >
                                <i className="fas fa-times me-2"></i>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resumen mientras se procesa */}
                    {processingPayment && (
                      <div className="row justify-content-center mt-4">
                        <div className="col-md-8">
                          <div className="card">
                            <div className="card-header bg-light">
                              <h6 className="mb-0 text-center">
                                <i className="fas fa-receipt me-2"></i>
                                Resumen de tu reserva
                              </h6>
                            </div>
                            <div className="card-body">
                              <div className="row mb-2">
                                <div className="col-6"><strong>Experiencia:</strong></div>
                                <div className="col-6">{experiencia.titulo}</div>
                              </div>
                              <div className="row mb-2">
                                <div className="col-6"><strong>Fecha:</strong></div>
                                <div className="col-6">
                                  {new Date(salidaSeleccionada.fechaInicio).toLocaleDateString('es-AR')}
                                </div>
                              </div>
                              <div className="row mb-2">
                                <div className="col-6"><strong>Personas:</strong></div>
                                <div className="col-6">{reservaData.cantidadPersonas}</div>
                              </div>
                              <div className="row mb-2">
                                <div className="col-6"><strong>Total:</strong></div>
                                <div className="col-6"><strong>{formatPrice(precioTotal)}</strong></div>
                              </div>
                              <div className="row">
                                <div className="col-6"><strong>Método de pago:</strong></div>
                                <div className="col-6">
                                  <i className="fas fa-credit-card me-1"></i>
                                  Mercado Pago
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Errores de validación */}
              {validationErrors.length > 0 && (
                <div className="alert alert-danger mt-3">
                  <h6 className="alert-heading">Por favor corrige los siguientes errores:</h6>
                  <ul className="mb-0">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Navigation buttons */}
              {step < 5 && (
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  {step > 1 ? (
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={goToPrevStep}
                      disabled={processingPayment}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Anterior
                    </button>
                  ) : (
                    <Link 
                      to={`/experiencias/${experienciaId}`}
                      className="btn btn-outline-secondary"
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Volver
                    </Link>
                  )}

                  {step < 4 ? (
                    <button 
                      className="btn btn-primary"
                      onClick={goToNextStep}
                    >
                      {step === 3 ? 'Ir a pago' : 'Siguiente'}
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  ) : (
                    <button 
                      className="btn btn-success px-4"
                      onClick={goToNextStep}
                      disabled={processingPayment}
                    >
                      {processingPayment ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Procesando pago...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-credit-card me-2"></i>
                          Confirmar Pago y Reserva
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Resumen */}
        <div className="col-lg-4">
          <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-header">
              <h6 className="mb-0">
                <i className="fas fa-receipt text-primary me-2"></i>
                Resumen
              </h6>
            </div>
            
            <div className="card-body">
              {/* Experiencia info */}
              <div className="d-flex mb-3">
                {experiencia.imagenUrl && (
                  <img 
                    src={experiencia.imagenUrl} 
                    alt={experiencia.titulo}
                    className="rounded me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h6 className="text-primary mb-1">{experiencia.titulo}</h6>
                  <small className="text-muted">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {experiencia.ubicacion.ciudad}, {experiencia.ubicacion.pais}
                  </small>
                </div>
              </div>

              <hr />

              {/* Fecha */}
              <div className="d-flex justify-content-between mb-2">
                <span><i className="fas fa-calendar text-muted me-2"></i>Fecha:</span>
                <small>
                  {new Date(salidaSeleccionada.fechaInicio).toLocaleDateString('es-AR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </small>
              </div>

              {/* Horario */}
              <div className="d-flex justify-content-between mb-2">
                <span><i className="fas fa-clock text-muted me-2"></i>Horario:</span>
                <small>
                  {new Date(salidaSeleccionada.fechaInicio).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              </div>

              {/* Personas */}
              <div className="d-flex justify-content-between mb-2">
                <span><i className="fas fa-users text-muted me-2"></i>Personas:</span>
                <span>{reservaData.cantidadPersonas}</span>
              </div>

              {/* Precio unitario */}
              <div className="d-flex justify-content-between mb-2">
                <span>Precio por persona:</span>
                <span>{formatPrice(experiencia.precio)}</span>
              </div>

              <hr />

              {/* Total */}
              <div className="d-flex justify-content-between fw-bold text-primary h5">
                <span>Total:</span>
                <span>{formatPrice(precioTotal)}</span>
              </div>

              {/* Políticas */}
              <div className="mt-3 p-2 bg-light rounded">
                <small className="text-muted">
                  <i className="fas fa-shield-alt text-success me-1"></i>
                  <strong>Reserva protegida</strong><br />
                  • Cancelación flexible<br />
                  • Soporte 24/7<br />
                  • Garantía TurisNow
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Estilos CSS adicionales para el componente
const styles = `
.payment-method-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
}

.payment-method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.checkout-step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  margin: 0 auto;
  transition: all 0.3s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.spinner-border {
  animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
}

.alert-success .fas.fa-check-circle,
.alert-danger .fas.fa-exclamation-triangle {
  animation: pulse 2s ease-in-out infinite;
}

.badge {
  font-size: 0.8rem;
}

.h6.text-primary, .h6.text-success {
  font-weight: 600;
}
`;

// Inyectar estilos si no existen
if (typeof document !== 'undefined' && !document.getElementById('reservar-experiencia-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'reservar-experiencia-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ReservarExperiencia;