import React from 'react';
import { Link } from 'react-router-dom';
import { useLikes } from '../contexts/LikeContext';
import { useCart } from '../contexts/CartContext';

const LikePage: React.FC = () => {
  const { items, remove, clear } = useLikes();
  const { add: addToCart } = useCart();

  const handleRemoveFromLikes = (id: number) => {
    remove(id);
  };

  const handleMoveToCart = (item: any) => {
    // Add to cart with default quantity 1
    addToCart({
      id: item.id,
      titulo: item.titulo,
      precio: item.precio,
      imagenUrl: item.imagenUrl
    }, 1);
    
    // Remove from likes
    remove(item.id);
  };

  const handleClearLikes = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar todos los elementos de tu lista de favoritos?')) {
      clear();
    }
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  return (
    <div className="container-fluid py-5">
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

            {items.length === 0 ? (
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
                  <h5 className="mb-0">{items.length} experiencia{items.length !== 1 ? 's' : ''} guardada{items.length !== 1 ? 's' : ''}</h5>
                  <button 
                    onClick={handleClearLikes}
                    className="btn btn-outline-danger btn-sm"
                  >
                    <i className="fa fa-trash me-2"></i>
                    Limpiar lista
                  </button>
                </div>

                <div className="row g-4">
                  {items.map((item) => (
                    <div key={item.id} className="col-lg-3 col-md-4 col-sm-6">
                      <div className="card h-100 shadow-sm">
                        <div className="position-relative">
                          {item.imagenUrl ? (
                            <img 
                              src={item.imagenUrl} 
                              className="card-img-top" 
                              alt={item.titulo}
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
                            onClick={() => handleRemoveFromLikes(item.id)}
                            className="tn-icon-button position-absolute top-0 end-0 m-2"
                            aria-label="Eliminar de favoritos"
                            title="Eliminar de favoritos"
                          >
                            <i className="fa fa-times"></i>
                          </button>

                          {item.categoria && (
                            <span className="badge bg-primary position-absolute bottom-0 start-0 m-2">
                              {item.categoria}
                            </span>
                          )}
                        </div>
                        
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title">{item.titulo}</h6>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="h6 text-primary mb-0">
                                {formatPrice(item.precio)}
                              </span>
                            </div>
                            
                            <div className="d-grid gap-2">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                className="btn btn-primary btn-sm"
                              >
                                <i className="fa fa-shopping-cart me-2"></i>
                                Mover al carrito
                              </button>
                              <Link
                                to={`/experiencias/${item.id}`}
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