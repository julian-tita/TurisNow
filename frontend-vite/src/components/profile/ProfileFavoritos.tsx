// filepath: frontend-vite/src/components/profile/ProfileFavoritos.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavoritos } from '../../hooks/useFavoritos';

const ProfileFavoritos: React.FC = () => {
  const { favoritos, loading, error, toggleFavorito, recargarFavoritos } = useFavoritos();

  useEffect(() => {
    recargarFavoritos();
  }, []);

  if (loading) {
    return (
      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Mis Favoritos</h5>
        <div className="placeholder-glow">
          <div className="row g-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="col-12 col-md-6 col-lg-4">
                <div className="card">
                  <div className="card-body">
                    <span className="placeholder col-8 mb-2"></span>
                    <span className="placeholder col-6 mb-2"></span>
                    <span className="placeholder col-7"></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card shadow-sm p-4">
        <h5 className="mb-3">Mis Favoritos</h5>
        <div className="alert alert-danger d-flex align-items-center justify-content-between">
          <span>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error al cargar favoritos
          </span>
          <button className="btn btn-sm btn-outline-danger" onClick={recargarFavoritos}>
            <i className="fas fa-sync-alt me-1"></i>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-danger rounded-circle d-flex align-items-center justify-content-center me-3" 
             style={{ width: '50px', height: '50px' }}>
          <i className="fas fa-heart text-white" style={{ fontSize: '1.5rem' }}></i>
        </div>
        <div>
          <h5 className="mb-1">Mis Favoritos</h5>
          <p className="text-muted mb-0">
            {favoritos.length === 0 
              ? 'No tienes favoritos guardados' 
              : `${favoritos.length} experiencia${favoritos.length !== 1 ? 's' : ''} favorita${favoritos.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>

      {favoritos.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-heart-broken text-muted mb-3" style={{ fontSize: '4rem' }}></i>
          <p className="text-muted mb-3">No tienes experiencias favoritas aún</p>
          <p className="text-muted mb-4">
            Explora nuestras experiencias y agrega tus favoritas para verlas aquí
          </p>
          <Link to="/experiencias" className="btn btn-primary">
            <i className="fas fa-search me-2"></i>
            Explorar Experiencias
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {favoritos.map((f) => (
            <div key={f.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border hover-shadow transition">
                {f.imagenPrincipal && (
                  <img 
                    src={f.imagenPrincipal} 
                    className="card-img-top" 
                    alt={f.titulo}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-2">
                    {f.titulo || `Experiencia #${f.experienciaId}`}
                  </h6>
                  
                  {f.ciudad && (
                    <p className="text-muted small mb-2">
                      <i className="fas fa-map-marker-alt me-1"></i>
                      {f.ciudad}
                    </p>
                  )}
                  
                  {f.categoria && (
                    <span className="badge bg-secondary mb-2" style={{ width: 'fit-content' }}>
                      {f.categoria}
                    </span>
                  )}

                  {f.descripcion && (
                    <p className="card-text text-muted small mb-3" style={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {f.descripcion}
                    </p>
                  )}

                  <div className="mt-auto">
                    {f.precioDesde && (
                      <div className="mb-2">
                        <strong className="text-primary">
                          {f.moneda} ${f.precioDesde.toLocaleString()}
                        </strong>
                        <small className="text-muted"> por persona</small>
                      </div>
                    )}

                    {f.calificacionPromedio && (
                      <div className="mb-3">
                        <i className="fas fa-star text-warning me-1"></i>
                        <span>{f.calificacionPromedio.toFixed(1)}</span>
                      </div>
                    )}

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                        onClick={() => toggleFavorito(f.experienciaId, f.titulo)}
                        title="Quitar de favoritos"
                      >
                        <i className="fas fa-heart-broken me-1"></i>
                        Quitar
                      </button>
                      <Link
                        to={`/experiencias/${f.experienciaId}`}
                        className="btn btn-sm btn-primary flex-grow-1"
                      >
                        <i className="fas fa-eye me-1"></i>
                        Ver
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileFavoritos;
