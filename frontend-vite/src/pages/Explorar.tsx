import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import experienciaService from '../services/experienciaService';
import type { Categoria } from '../types/experiencia.types';
import { CategoriaMeta, normalizeCategoria } from '../types/experiencia.types';

interface CategoriaConConteo {
  categoria: Categoria;
  cantidad: number;
}

const Explorar: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasConConteo, setCategoriasConConteo] = useState<CategoriaConConteo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar categorías con conteo
      const conteo = await experienciaService.getCategoriasConConteo();
      setCategoriasConConteo(conteo);
      
      // Extraer solo las categorías disponibles
      const categoriasDisponibles = conteo.map(c => c.categoria);
      setCategorias(categoriasDisponibles);

    } catch (err: any) {
      console.error('Error cargando categorías:', err);
      setError('No se pudieron cargar las categorías');
      
      // Fallback: mostrar todas las categorías sin conteo
      const todasCategorias: Categoria[] = ['PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'];
      setCategorias(todasCategorias);
    } finally {
      setLoading(false);
    }
  };

  const getCantidadPorCategoria = (categoria: Categoria): number => {
    const encontrada = categoriasConConteo.find(c => c.categoria === categoria);
    return encontrada?.cantidad || 0;
  };

  return (
    <div className="container-fluid" style={{ paddingTop: '120px' }}>
      <div className="container my-5">
        {/* Hero Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">
            <i className="fa fa-compass me-3"></i>
            Explorar Experiencias
          </h1>
          <p className="lead text-muted mb-4">
            Descubre aventuras increíbles organizadas por categorías
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mt-3">Cargando categorías...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="alert alert-warning text-center">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Categories Grid */}
        {!loading && categorias.length > 0 && (
          <div className="row g-4">
            {categorias.map((categoria) => {
              // Normalizar y validar categoría
              const categoriaNormalizada = normalizeCategoria(categoria);
              if (!categoriaNormalizada) {
                console.warn(`⚠️ Categoría no reconocida: ${categoria}`);
                return null;
              }
              
              const meta = CategoriaMeta[categoriaNormalizada];
              const cantidad = getCantidadPorCategoria(categoriaNormalizada);
              
              return (
                <div key={categoria} className="col-12 col-md-6 col-lg-4">
                  <Link 
                    to={`/experiencias?categoria=${categoriaNormalizada}`}
                    className="text-decoration-none"
                  >
                    <div className="card h-100 shadow-sm border-0 rounded-4 category-card">
                      <div className="card-body text-center p-4">
                        <div 
                          className={`${meta.color} rounded-circle d-inline-flex align-items-center justify-content-center mb-4`}
                          style={{ width: '80px', height: '80px' }}
                        >
                          <i className={`fas ${meta.icon} text-white`} style={{ fontSize: '2rem' }}></i>
                        </div>
                        
                        <h4 className="card-title mb-3 text-dark">{meta.label}</h4>
                        <p className="card-text text-muted mb-4">{meta.description}</p>
                        
                        {cantidad > 0 && (
                          <div className="mb-3">
                            <span className="badge bg-light text-dark">
                              <i className="fas fa-map-marked-alt me-1"></i>
                              {cantidad} {cantidad === 1 ? 'experiencia' : 'experiencias'}
                            </span>
                          </div>
                        )}
                        
                        <button className="btn btn-outline-primary btn-lg">
                          Explorar {meta.label}
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && categorias.length === 0 && !error && (
          <div className="text-center py-5">
            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No hay categorías disponibles</h5>
          </div>
        )}

        {/* CTA Section */}
        <div className="card bg-light border-0 rounded-4 mt-5">
          <div className="card-body text-center p-5">
            <h3 className="text-primary mb-3">¿No encontraste lo que buscabas?</h3>
            <p className="text-muted mb-4">
              Explora todas nuestras experiencias disponibles
            </p>
            <Link to="/experiencias" className="btn btn-primary btn-lg">
              <i className="fas fa-search me-2"></i>
              Ver todas las experiencias
            </Link>
          </div>
        </div>
      </div>
      
      <style>{`
        .category-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Explorar;