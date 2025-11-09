import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import experienciaService from '../../services/experienciaService';
import type { ExperienciaDetalleDTO } from '../../types/experiencia.types';
import { useCarrito } from '../../hooks/useCarrito';
import { useFavoritos } from '../../hooks/useFavoritos';
import SkeletonCard from '../common/SkeletonCard';
import CalendarioDisponibilidad from '../common/CalendarioDisponibilidad';

const ExperienciaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experiencia, setExperiencia] = useState<ExperienciaDetalleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalida, setSelectedSalida] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [vistaCalendario, setVistaCalendario] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  
  // Cart and Favorites functionality
  const { agregarItem } = useCarrito();
  const { isFavorito, toggleFavorito } = useFavoritos();

  // Handler functions
  const handleAddToCart = async () => {
    if (!experiencia) return;
    
    if (!selectedSalida) {
      toast.error('Por favor selecciona una fecha para continuar');
      return;
    }
    
    await agregarItem({
      experienciaId: experiencia.id,
      salidaId: selectedSalida,
      cantidad: cantidad
    }, experiencia.titulo);
  };

  const handleToggleFavorite = () => {
    if (!experiencia) return;
    toggleFavorito(experiencia.id, experiencia.titulo);
  };

  // Handler para la selección de fecha en el calendario
  const handleDateSelect = (fecha: Date, salidaId: number | null) => {
    setSelectedDate(fecha);
    if (salidaId) {
      setSelectedSalida(salidaId);
      toast.success('Fecha seleccionada correctamente');
    }
  };

  const isLiked = experiencia ? isFavorito(experiencia.id) : false;

  useEffect(() => {
    if (id) {
      loadExperienciaDetail(parseInt(id));
    }
  }, [id]);

  const loadExperienciaDetail = async (experienciaId: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await experienciaService.getExperienciaById(experienciaId);
      setExperiencia(data);

      // Auto-seleccionar la primera salida disponible
      if (data.salidas.length > 0) {
        const primeraConCupos = data.salidas.find(s => s.capacidadDisponible > 0);
        if (primeraConCupos) {
          setSelectedSalida(primeraConCupos.id);
        }
      }

    } catch (error: any) {
      let errorMsg: string;
      if (error.response?.status === 404) {
        errorMsg = 'La experiencia que buscas no existe.';
      } else {
        errorMsg = 'Error al cargar la experiencia. Por favor, intenta nuevamente.';
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (precio: number, moneda: string) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 0
    });
    return formatter.format(precio);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUbicacionCompleta = (ubicacion: any) => {
    if (ubicacion.region) {
      return `${ubicacion.ciudad}, ${ubicacion.region}, ${ubicacion.pais}`;
    }
    return `${ubicacion.ciudad}, ${ubicacion.pais}`;
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: { [key: string]: string } = {
      'PLAYA': '🏖️',
      'MONTANA': '🏔️',
      'AVENTURA': '🚀',
      'GASTRONOMIA': '🍽️',
      'CULTURA': '🎭'
    };
    return icons[categoria] || '🏞️';
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: { [key: string]: string } = {
      'PLAYA': 'Playa',
      'MONTANA': 'Montaña',
      'AVENTURA': 'Aventura',
      'GASTRONOMIA': 'Gastronomía',
      'CULTURA': 'Cultura'
    };
    return labels[categoria] || categoria;
  };

  const getCapacidadStatus = (disponible: number, total: number) => {
    const porcentaje = (disponible / total) * 100;
    if (porcentaje === 0) return { color: '#dc3545', text: 'Sin cupos' };
    if (porcentaje <= 25) return { color: '#fd7e14', text: 'Últimos cupos' };
    if (porcentaje <= 50) return { color: '#ffc107', text: 'Cupos limitados' };
    return { color: '#28a745', text: 'Cupos disponibles' };
  };

  const handleReservar = () => {
    if (!selectedSalida) {
      toast.error('Por favor selecciona una fecha para continuar.');
      return;
    }
    
    // Navegar a la página de reserva con el ID de la experiencia y la salida seleccionada
    navigate(`/reservar/${id}/${selectedSalida}`);
  };

  if (loading) {
    return (
      <div className="experiencia-detail-container">
        <SkeletonCard variant="experienciaDetail" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="experiencia-detail-error">
        <div className="error-content">
          <h2>❌ {error}</h2>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="btn-back">
              ← Volver
            </button>
            <Link to="/experiencias" className="btn-catalog">
              Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!experiencia) {
    return null;
  }

  return (
    <div className="experiencia-detail-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span>→</span>
        <Link to="/experiencias">Experiencias</Link>
        <span>→</span>
        <span>{experiencia.titulo}</span>
      </nav>

      {/* Hero Section */}
      <div className="detail-hero">
        <div className="hero-image">
          {experiencia.imagenUrl ? (
            <img 
              src={experiencia.imagenUrl} 
              alt={experiencia.titulo}
              onError={(e) => {
                e.currentTarget.src = '/assets/img/placeholder-experiencia-large.jpg';
              }}
            />
          ) : (
            <div className="image-placeholder-large">
              <span className="placeholder-icon">🏞️</span>
              <span className="placeholder-text">Imagen no disponible</span>
            </div>
          )}
          
          <div className="hero-overlay">
            <div className="hero-content">
              <div className="category-badge">
                {getCategoriaIcon(experiencia.categoria)} {getCategoriaLabel(experiencia.categoria)}
              </div>
              <h1 className="hero-title">{experiencia.titulo}</h1>
              <div className="hero-location">
                📍 {getUbicacionCompleta(experiencia.ubicacion)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="content-grid">
          {/* Información Principal */}
          <div className="main-content">
            <section className="description-section">
              <h2>📖 Descripción</h2>
              <div className="description-content">
                <p>{experiencia.descripcion}</p>
              </div>
            </section>

            {/* Tags */}
            {experiencia.tags.length > 0 && (
              <section className="tags-section">
                <h3>🏷️ Características</h3>
                <div className="tags-container">
                  {experiencia.tags.map((tag, index) => (
                    <span key={index} className="tag-detail">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Fechas Disponibles */}
            <section className="salidas-section">
              <div className="salidas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>📅 Fechas Disponibles</h2>
                {experiencia.salidas.length > 0 && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setVistaCalendario(!vistaCalendario)}
                  >
                    {vistaCalendario ? '📋 Vista Lista' : '📅 Vista Calendario'}
                  </button>
                )}
              </div>

              {experiencia.salidas.length === 0 ? (
                <div className="no-salidas">
                  <p>⚠️ No hay fechas disponibles para esta experiencia en este momento.</p>
                  <p>Contáctanos para más información sobre próximas salidas.</p>
                </div>
              ) : vistaCalendario ? (
                /* Vista Calendario */
                <CalendarioDisponibilidad
                  salidas={experiencia.salidas.map(s => ({
                    id: s.id,
                    fechaInicio: s.fechaInicio,
                    capacidadDisponible: s.capacidadDisponible,
                    capacidadTotal: s.capacidadTotal
                  }))}
                  onDateSelect={handleDateSelect}
                  selectedDate={selectedDate}
                />
              ) : (
                /* Vista Lista */
                <div className="salidas-grid">
                  {experiencia.salidas.map((salida) => {
                    const status = getCapacidadStatus(salida.capacidadDisponible, salida.capacidadTotal);
                    const isSelected = selectedSalida === salida.id;
                    const isDisponible = salida.capacidadDisponible > 0;

                    return (
                      <div 
                        key={salida.id}
                        className={`salida-card ${isSelected ? 'selected' : ''} ${!isDisponible ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisponible) {
                            setSelectedSalida(salida.id);
                            setSelectedDate(new Date(salida.fechaInicio));
                          }
                        }}
                      >
                        <div className="salida-date">
                          <div className="date-main">
                            {formatDate(salida.fechaInicio)}
                          </div>
                          <div className="date-time">
                            {formatTime(salida.fechaInicio)}
                            {salida.fechaFin && (
                              <span> - {formatTime(salida.fechaFin)}</span>
                            )}
                          </div>
                        </div>

                        <div className="salida-capacity">
                          <div className="capacity-bar">
                            <div 
                              className="capacity-fill"
                              style={{ 
                                width: `${((salida.capacidadTotal - salida.capacidadDisponible) / salida.capacidadTotal) * 100}%`,
                                backgroundColor: status.color
                              }}
                            ></div>
                          </div>
                          <div className="capacity-text" style={{ color: status.color }}>
                            {status.text} ({salida.capacidadDisponible}/{salida.capacidadTotal})
                          </div>
                        </div>

                        {isSelected && (
                          <div className="selected-indicator">
                            ✓ Seleccionada
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar de Reserva */}
          <div className="booking-sidebar">
            <div className="booking-card">
              <div className="price-section">
                <div className="price-label">Precio por persona</div>
                <div className="price-value">
                  {formatPrice(experiencia.precio, experiencia.moneda)}
                </div>
              </div>

              {experiencia.salidas.length > 0 && (
                <>
                  <div className="selected-date-section">
                    <h4>📅 Fecha seleccionada</h4>
                    {selectedSalida ? (
                      <div className="selected-date-info">
                        {(() => {
                          const salida = experiencia.salidas.find(s => s.id === selectedSalida);
                          return salida ? (
                            <>
                              <div className="date-text">
                                {formatDate(salida.fechaInicio)}
                              </div>
                              <div className="time-text">
                                {formatTime(salida.fechaInicio)}
                                {salida.fechaFin && ` - ${formatTime(salida.fechaFin)}`}
                              </div>
                              <div className="capacity-info">
                                {salida.capacidadDisponible} cupos disponibles
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    ) : (
                      <p className="no-date-selected">
                        Selecciona una fecha arriba
                      </p>
                    )}
                  </div>

                  {/* Selector de cantidad */}
                  {selectedSalida && (
                    <div className="quantity-selector mb-3">
                      <label className="form-label small fw-bold">Cantidad de personas</label>
                      <div className="input-group">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                          disabled={cantidad <= 1}
                        >
                          <i className="fa fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={cantidad}
                          min="1"
                          max={experiencia.salidas.find(s => s.id === selectedSalida)?.capacidadDisponible || 1}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const maxCap = experiencia.salidas.find(s => s.id === selectedSalida)?.capacidadDisponible || 1;
                            setCantidad(Math.min(Math.max(1, val), maxCap));
                          }}
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => {
                            const maxCap = experiencia.salidas.find(s => s.id === selectedSalida)?.capacidadDisponible || 1;
                            setCantidad(Math.min(cantidad + 1, maxCap));
                          }}
                          disabled={cantidad >= (experiencia.salidas.find(s => s.id === selectedSalida)?.capacidadDisponible || 1)}
                        >
                          <i className="fa fa-plus"></i>
                        </button>
                      </div>
                      <small className="text-muted">
                        Total: {formatPrice(experiencia.precio * cantidad, experiencia.moneda)}
                      </small>
                    </div>
                  )}

                  <div className="booking-actions">
                    <button 
                      className="btn-reservar"
                      onClick={handleReservar}
                      disabled={!selectedSalida}
                    >
                      {selectedSalida ? '🎫 Reservar Ahora' : '📅 Selecciona una fecha'}
                    </button>
                    
                    {/* Cart and Favorite buttons */}
                    <div className="booking-secondary-actions">
                      <button 
                        className="btn-cart"
                        onClick={handleAddToCart}
                        disabled={!selectedSalida}
                      >
                        🛒 Agregar al Carrito
                      </button>
                      
                      <button 
                        className={`btn-favorite ${isLiked ? 'liked' : ''}`}
                        onClick={handleToggleFavorite}
                      >
                        {isLiked ? '❤️' : '🤍'} Favorito
                      </button>
                    </div>
                    
                    <div className="contact-info">
                      <p>¿Tienes preguntas?</p>
                      <a href="mailto:info@turisnow.com" className="contact-link">
                        📧 Contáctanos
                      </a>
                    </div>
                  </div>
                </>
              )}

              {experiencia.salidas.length === 0 && (
                <div className="no-booking">
                  <p>📞 Contáctanos para conocer disponibilidad</p>
                  <a href="mailto:info@turisnow.com" className="btn-contact">
                    Consultar Disponibilidad
                  </a>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="info-card">
              <h4>ℹ️ Información importante</h4>
              <ul className="info-list">
                <li>✅ Confirmación inmediata</li>
                <li>🎫 Tickets móviles aceptados</li>
                <li>♿ Accesible para sillas de ruedas</li>
                <li>🗣️ Guía en español</li>
                <li>📷 Permitidas las fotos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Botón volver */}
      <div className="detail-actions">
        <button onClick={() => navigate(-1)} className="btn-back-detail">
          ← Volver
        </button>
        <Link to="/experiencias" className="btn-catalog-detail">
          Ver más experiencias
        </Link>
      </div>
    </div>
  );
};

export default ExperienciaDetail;