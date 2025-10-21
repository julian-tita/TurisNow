import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../types/experience';

const Explorar: React.FC = () => {
  const categories: { 
    key: Category; 
    name: string; 
    description: string; 
    icon: string;
    color: string;
  }[] = [
    {
      key: 'playa',
      name: 'Playa',
      description: 'Relájate en las mejores costas y disfruta del sol',
      icon: 'fas fa-umbrella-beach',
      color: 'bg-info'
    },
    {
      key: 'montaña',
      name: 'Montaña',
      description: 'Aventuras en las cimas más espectaculares',
      icon: 'fas fa-mountain',
      color: 'bg-success'
    },
    {
      key: 'aventura',
      name: 'Aventura',
      description: 'Experiencias llenas de adrenalina y emoción',
      icon: 'fas fa-hiking',
      color: 'bg-danger'
    },
    {
      key: 'gastronomía',
      name: 'Gastronomía',
      description: 'Descubre sabores únicos y tradiciones culinarias',
      icon: 'fas fa-utensils',
      color: 'bg-warning'
    },
    {
      key: 'cultura',
      name: 'Cultura',
      description: 'Sumérgete en la historia y las tradiciones locales',
      icon: 'fas fa-landmark',
      color: 'bg-secondary'
    }
  ];

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

        {/* Categories Grid */}
        <div className="row g-4">
          {categories.map((category) => (
            <div key={category.key} className="col-12 col-md-6 col-lg-4">
              <Link 
                to={`/experiencias?categoria=${category.key}`}
                className="text-decoration-none"
              >
                <div className="card h-100 shadow-sm border-0 rounded-4 category-card">
                  <div className="card-body text-center p-4">
                    <div className={`${category.color} rounded-circle d-inline-flex align-items-center justify-content-center mb-4`}
                         style={{ width: '80px', height: '80px' }}>
                      <i className={`${category.icon} text-white`} style={{ fontSize: '2rem' }}></i>
                    </div>
                    
                    <h4 className="card-title mb-3 text-dark">{category.name}</h4>
                    <p className="card-text text-muted mb-4">{category.description}</p>
                    
                    <button className="btn btn-outline-primary btn-lg">
                      Explorar {category.name}
                      <i className="fas fa-arrow-right ms-2"></i>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="card bg-light border-0 rounded-4 mt-5">
          <div className="card-body text-center p-5">
            <h3 className="text-primary mb-3">¿No encontraste lo que buscabas?</h3>
            <p className="text-muted mb-4">
              Explora todas nuestras experiencias disponibles
            </p>
            <Link to="/experiencias" className="btn btn-primary btn-lg">
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