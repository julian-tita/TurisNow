import React from 'react';
import { Link } from 'react-router-dom';
import { ExperienciaListadoDTO } from '../../types/experiencia.types';
import { useLikes } from '../../contexts/LikeContext';
import { useCart } from '../../contexts/CartContext';

interface ExperienciaCardProps {
  experiencia: ExperienciaListadoDTO;
  className?: string;
  showFullDescription?: boolean;
}

const ExperienciaCard: React.FC<ExperienciaCardProps> = ({
  experiencia,
  className = '',
  showFullDescription = false
}) => {
  const { toggle: toggleLike, has: isLiked } = useLikes();
  const { add: addToCart } = useCart();
  
  const isLikedState = isLiked(experiencia.id);
  const categorias: { [key: string]: string } = {
    'PLAYA': '🏖️ Playa',
    'MONTANA': '🏔️ Montaña',
    'AVENTURA': '🚀 Aventura',
    'GASTRONOMIA': '🍽️ Gastronomía',
    'CULTURA': '🎭 Cultura'
  };

  const formatPrice = (precio: number, moneda: string) => {
    const formatter = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: moneda === 'ARS' ? 'ARS' : 'USD',
      minimumFractionDigits: 0
    });
    return formatter.format(precio);
  };

  const getUbicacionCompleta = (ubicacion: any) => {
    if (ubicacion.region) {
      return `${ubicacion.ciudad}, ${ubicacion.region}, ${ubicacion.pais}`;
    }
    return `${ubicacion.ciudad}, ${ubicacion.pais}`;
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (showFullDescription || text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleLike({
      id: experiencia.id,
      titulo: experiencia.titulo,
      precio: experiencia.precio,
      imagenUrl: experiencia.imagenUrl,
      categoria: experiencia.categoria
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: experiencia.id,
      titulo: experiencia.titulo,
      precio: experiencia.precio,
      imagenUrl: experiencia.imagenUrl
    }, 1);
  };

  return (
    <div className={`experiencia-card ${className}`}>
      <div className="card-image">
        {experiencia.imagenUrl ? (
          <img 
            src={experiencia.imagenUrl} 
            alt={experiencia.titulo}
            onError={(e) => {
              e.currentTarget.src = '/assets/img/placeholder-experiencia.jpg';
            }}
          />
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-icon">🏞️</span>
            <span className="placeholder-text">Imagen no disponible</span>
          </div>
        )}
        
        <div className="card-category">
          {categorias[experiencia.categoria] || experiencia.categoria}
        </div>

        {experiencia.proximasSalidas && experiencia.proximasSalidas > 0 && (
          <div className="card-badge">
            📅 {experiencia.proximasSalidas} salida{experiencia.proximasSalidas > 1 ? 's' : ''}
          </div>
        )}

        {/* Quick actions overlay */}
        <div className="tn-card-actions">
          <button
            onClick={handleToggleLike}
            className={`tn-icon-button ${isLikedState ? 'liked' : ''}`}
            aria-label={isLikedState ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={isLikedState ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <i className={`fa ${isLikedState ? 'fa-heart' : 'fa-heart-o'}`}></i>
          </button>
          <button
            onClick={handleAddToCart}
            className="tn-icon-button"
            aria-label="Agregar al carrito"
            title="Agregar al carrito"
          >
            <i className="fa fa-shopping-cart"></i>
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{experiencia.titulo}</h3>
        
        <p className="card-description">
          {truncateDescription(experiencia.descripcion)}
        </p>

        <div className="card-details">
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-text">{getUbicacionCompleta(experiencia.ubicacion)}</span>
          </div>

          <div className="detail-item price">
            <span className="detail-icon">💰</span>
            <span className="detail-text price-text">
              Desde {formatPrice(experiencia.precio, experiencia.moneda)}
            </span>
          </div>
        </div>

        {experiencia.tags.length > 0 && (
          <div className="card-tags">
            {experiencia.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
            {experiencia.tags.length > 3 && (
              <span className="tag more-tags">
                +{experiencia.tags.length - 3} más
              </span>
            )}
          </div>
        )}

        <div className="card-actions">
          <Link 
            to={`/experiencias/${experiencia.id}`}
            className="btn-ver-detalle"
          >
            Ver Detalle
          </Link>
        </div>
      </div>

      {/* Overlay de hover para interactividad */}
      <div className="card-overlay">
        <Link 
          to={`/experiencias/${experiencia.id}`}
          className="overlay-link"
        >
          <div className="overlay-content">
            <span className="overlay-text">Ver Experiencia</span>
            <span className="overlay-arrow">→</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ExperienciaCard;