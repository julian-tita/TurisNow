import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import experienciaService from '../../services/experienciaService';
import type { ExperienciaDetalleDTO } from '../../types/experiencia.types';
import { useCart } from '../../contexts/CartContext';
import { useLikes } from '../../contexts/LikeContext';

const ExperienciaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [experiencia, setExperiencia] = useState<ExperienciaDetalleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSalida, setSelectedSalida] = useState<number | null>(null);
  
  // Cart and Likes functionality
  const { add } = useCart();
  const { has, toggle } = useLikes();

  // Handler functions
  const handleAddToCart = () => {
    if (!experiencia) return;
    
    if (!selectedSalida) {
      alert('Por favor selecciona una fecha para continuar');
      return;
    }
    
    const selectedSalidaData = experiencia.salidas.find(s => s.id === selectedSalida);
    
    const cartItem = {
      id: experiencia.id,
      titulo: experiencia.titulo,
      precio: experiencia.precio,
      imagenUrl: experiencia.imagenUrl,
      cantidad: 1,
      fechaSalida: selectedSalidaData?.fechaInicio
    };
    
    add(cartItem);
    alert('Experiencia añadida al carrito');
  };

  const handleToggleFavorite = () => {
    if (!experiencia) return;
    
    const likeItem = {
      id: experiencia.id,
      titulo: experiencia.titulo,
      precio: experiencia.precio,
      imagenUrl: experiencia.imagenUrl,
      categoria: experiencia.categoria
    };
    
    toggle(likeItem);
  };

  const isLiked = experiencia ? has(experiencia.id) : false;

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
      console.error('Error loading experiencia detail:', error);
      if (error.response?.status === 404) {
        setError('La experiencia que buscas no existe.');
      } else {
        setError('Error al cargar la experiencia. Por favor, intenta nuevamente.');
      }
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
      alert('Por favor selecciona una fecha para continuar.');
      return;
    }
    
    // Navegar a la página de reserva con el ID de la experiencia y la salida seleccionada
    navigate(`/reservar/${id}/${selectedSalida}`);
  };

  if (loading) {
    return (
      <div className="experiencia-detail-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando experiencia...</p>
        </div>
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
              <h2>📅 Fechas Disponibles</h2>
              {experiencia.salidas.length === 0 ? (
                <div className="no-salidas">
                  <p>⚠️ No hay fechas disponibles para esta experiencia en este momento.</p>
                  <p>Contáctanos para más información sobre próximas salidas.</p>
                </div>
              ) : (
                <div className="salidas-grid">
                  {experiencia.salidas.map((salida) => {
                    const status = getCapacidadStatus(salida.capacidadDisponible, salida.capacidadTotal);
                    const isSelected = selectedSalida === salida.id;
                    const isDisponible = salida.capacidadDisponible > 0;

                    return (
                      <div 
                        key={salida.id}
                        className={`salida-card ${isSelected ? 'selected' : ''} ${!isDisponible ? 'disabled' : ''}`}
                        onClick={() => isDisponible && setSelectedSalida(salida.id)}
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