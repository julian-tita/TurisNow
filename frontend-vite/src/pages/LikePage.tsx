import React from 'react';
import { Link } from 'react-router-dom';
import { useFavoritos } from '../hooks/useFavoritos';
import SkeletonCard from '../components/common/SkeletonCard';

const LikePage: React.FC = () => {
  const { favoritos, loading, eliminarFavorito } = useFavoritos();

  const handleRemoveFromLikes = (experienciaId: number, titulo: string) => {
    eliminarFavorito(experienciaId, titulo);
  };

  const handleClearLikes = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todos los elementos de tu lista de favoritos?')) {
      // Eliminar todos los favoritos uno por uno
      for (const fav of favoritos) {
        await eliminarFavorito(fav.experienciaId);
      }
    }
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  if (loading) {
    return (
      <div className="container-fluid py-5" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="text-center mb-5">
                <h1 className="display-5 mb-3">
                  <i className="fa fa-heart text-danger me-3"></i>
                  Mis Favoritos
                </h1>
              </div>
              <div className="row g-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                    <SkeletonCard variant="experiencia" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-5" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h1 className="display-5 mb-3">
                <i className="fa fa-heart text-danger me-3"></i>
                Mis Favoritos
              </h1>
              <p className="lead">Experiencias que has guardado para reservar más tarde</p>
            </div>

            {favoritos.length === 0 ? (
              <div className="tn-empty text-center py-5">
                <div className="mb-4">
                  <i className="fa fa-heart-o" style={{ fontSize: '5rem', color: '#ddd' }}></i>
                </div>
                <h3 className="mb-3">No tienes favoritos guardados</h3>
                <p className="text-muted mb-4">
                  Explora nuestras experiencias y guarda las que más te interesen
                </p>
                <Link to="/experiencias" className="btn btn-primary btn-lg">
                  <i className="fa fa-search me-2"></i>
                  Explorar Experiencias
                </Link>
              </div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">{favoritos.length} experiencia{favoritos.length !== 1 ? 's' : ''} guardada{favoritos.length !== 1 ? 's' : ''}</h5>
                  <button 
                    onClick={handleClearLikes}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <i className="fa fa-trash me-2"></i>
                    Limpiar lista
                  </button>
                </div>

                <div className="row g-4">
                  {favoritos.map((fav) => (
                    <div key={fav.id} className="col-lg-3 col-md-4 col-sm-6">
                      <div className="card h-100 shadow-sm">
                        <div className="position-relative">
                          {fav.imagenPrincipal ? (
                            <img 
                              src={fav.imagenPrincipal} 
                              className="card-img-top" 
                              alt={fav.titulo}
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="bg-light d-flex align-items-center justify-content-center"
                              style={{ height: '200px' }}
                            >
                              <i className="fa fa-image fa-3x text-muted"></i>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleRemoveFromLikes(fav.experienciaId, fav.titulo)}
                            className="tn-icon-button position-absolute top-0 end-0 m-2"
                            aria-label="Eliminar de favoritos"
                            title="Eliminar de favoritos"
                          >
                            <i className="fa fa-times"></i>
                          </button>

                          {fav.categoria && (
                            <span className="badge bg-primary position-absolute bottom-0 start-0 m-2">
                              {fav.categoria}
                            </span>
                          )}
                        </div>
                        
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title">{fav.titulo}</h6>
                          {fav.descripcion && (
                            <p className="card-text text-muted small">{fav.descripcion.substring(0, 80)}...</p>
                          )}
                          {fav.ciudad && (
                            <p className="text-muted small mb-2">
                              <i className="fa fa-map-marker me-1"></i>
                              {fav.ciudad}
                            </p>
                          )}
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="h6 text-primary mb-0">
                                {formatPrice(fav.precioDesde)}
                              </span>
                              {fav.calificacionPromedio && (
                                <span className="text-warning small">
                                  <i className="fa fa-star"></i> {fav.calificacionPromedio.toFixed(1)}
                                </span>
                              )}
                            </div>
                            
                            <div className="d-grid gap-2">
                              <Link
                                to={`/experiencias/${fav.experienciaId}`}
                                className="btn btn-primary btn-sm"
                              >
                                <i className="fa fa-calendar me-2"></i>
                                Ver fechas disponibles
                              </Link>
                              <Link
                                to={`/experiencias/${fav.experienciaId}`}
                                className="btn btn-outline-primary btn-sm"
                              >
                                Ver detalles
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-5">
                  <Link to="/experiencias" className="btn btn-outline-primary">
                    <i className="fa fa-plus me-2"></i>
                    Seguir explorando
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LikePage;