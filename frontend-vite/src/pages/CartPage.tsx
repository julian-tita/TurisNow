import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage: React.FC = () => {
  const { items, totals, remove, setCantidad, setFecha, clear } = useCart();

  const handleRemoveItem = (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este elemento del carrito?')) {
      remove(id);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      clear();
    }
  };

  const handleQuantityChange = (id: number, cantidad: number) => {
    if (cantidad >= 1) {
      setCantidad(id, cantidad);
    }
  };

  const handleDateChange = (id: number, fecha: string) => {
    setFecha(id, fecha);
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="container-fluid py-5" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-5">
              <h1 className="display-5 mb-3">
                <i className="fa fa-shopping-cart text-primary me-3"></i>
                Mi Carrito
              </h1>
              <p className="lead">Revisa tus experiencias seleccionadas antes de continuar</p>
            </div>

            {items.length === 0 ? (
              <div className="tn-empty text-center py-5">
                <div className="mb-4">
                  <i className="fa fa-shopping-cart" style={{ fontSize: '5rem', color: '#ddd' }}></i>
                </div>
                <h3 className="mb-3">Tu carrito está vacío</h3>
                <p className="text-muted mb-4">
                  Agrega algunas experiencias increíbles para comenzar tu aventura
                </p>
                <Link to="/experiencias" className="btn btn-primary btn-lg">
                  <i className="fa fa-search me-2"></i>
                  Buscar Experiencias
                </Link>
              </div>
            ) : (
              <div className="row">
                <div className="col-lg-8">
                  <div className="tn-cart-grid">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="mb-0">{items.length} experiencia{items.length !== 1 ? 's' : ''} en el carrito</h5>
                      <button 
                        onClick={handleClearCart}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <i className="fa fa-trash me-2"></i>
                        Vaciar carrito
                      </button>
                    </div>

                    {items.map((item) => (
                      <div key={item.id} className="card mb-3">
                        <div className="row g-0">
                          <div className="col-md-3">
                            {item.imagenUrl ? (
                              <img 
                                src={item.imagenUrl} 
                                className="img-fluid rounded-start h-100" 
                                alt={item.titulo}
                                style={{ objectFit: 'cover', minHeight: '150px' }}
                              />
                            ) : (
                              <div 
                                className="bg-light d-flex align-items-center justify-content-center rounded-start h-100"
                                style={{ minHeight: '150px' }}
                              >
                                <i className="fa fa-image fa-2x text-muted"></i>
                              </div>
                            )}
                          </div>
                          <div className="col-md-9">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="card-title mb-0">{item.titulo}</h6>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="tn-icon-button"
                                  aria-label="Eliminar del carrito"
                                  title="Eliminar del carrito"
                                >
                                  <i className="fa fa-times"></i>
                                </button>
                              </div>
                              
                              <div className="row g-3">
                                <div className="col-md-4">
                                  <label className="form-label small">Fecha de salida</label>
                                  <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={item.fechaSalida || ''}
                                    min={getTomorrowDate()}
                                    onChange={(e) => handleDateChange(item.id, e.target.value)}
                                  />
                                </div>
                                
                                <div className="col-md-4">
                                  <label className="form-label small">Cantidad de personas</label>
                                  <div className="input-group input-group-sm">
                                    <button
                                      className="btn btn-outline-secondary"
                                      type="button"
                                      onClick={() => handleQuantityChange(item.id, item.cantidad - 1)}
                                      disabled={item.cantidad <= 1}
                                    >
                                      <i className="fa fa-minus"></i>
                                    </button>
                                    <input
                                      type="number"
                                      className="form-control text-center"
                                      value={item.cantidad}
                                      min="1"
                                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                    />
                                    <button
                                      className="btn btn-outline-secondary"
                                      type="button"
                                      onClick={() => handleQuantityChange(item.id, item.cantidad + 1)}
                                    >
                                      <i className="fa fa-plus"></i>
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="col-md-4">
                                  <label className="form-label small">Precio total</label>
                                  <div className="h6 text-primary">
                                    {formatPrice(item.precio * item.cantidad)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="tn-cart-summary">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Resumen del pedido</h5>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Subtotal:</span>
                          <span>{formatPrice(totals.subtotal)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Impuestos (21%):</span>
                          <span>{formatPrice(totals.impuestos)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Envío:</span>
                          <span className="text-success">
                            {totals.envio === 0 ? 'Gratis' : formatPrice(totals.envio)}
                          </span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between h5">
                          <span>Total:</span>
                          <span className="text-primary">{formatPrice(totals.total)}</span>
                        </div>
                        
                        <div className="d-grid gap-2 mt-4">
                          <button className="btn btn-primary btn-lg">
                            <i className="fa fa-credit-card me-2"></i>
                            Continuar al checkout
                          </button>
                          <Link to="/experiencias" className="btn btn-outline-secondary">
                            Seguir comprando
                          </Link>
                        </div>
                        
                        <div className="text-center mt-3">
                          <small className="text-muted">
                            <i className="fa fa-lock me-1"></i>
                            Compra segura y protegida
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;