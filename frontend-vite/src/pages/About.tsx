import React from 'react';

const About: React.FC = () => {
  return (
    <div>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Nosotros
              </h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb justify-content-center">
                  <li className="breadcrumb-item">
                    <a href="/">Inicio</a>
                  </li>
                  <li
                    className="breadcrumb-item text-white active"
                    aria-current="page"
                  >
                    Nosotros
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
        
      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div
              className="col-lg-6 wow fadeInUp"
              data-wow-delay="0.1s"
              style={{ minHeight: 400 }}
            >
              <div className="position-relative h-100">
                <img
                  className="img-fluid position-absolute w-100 h-100"
                  src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="TurisNow - Acerca de nosotros"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className="section-title bg-white text-start text-primary pe-3">
                Acerca de Nosotros
              </h6>
              <h1 className="mb-4">
                Bienvenido a <span className="text-primary">TurisNow</span>
              </h1>
              <p className="mb-4">
                En TurisNow, somos apasionados por crear experiencias de viaje inolvidables que conecten a nuestros clientes con los destinos más fascinantes del mundo. Con años de experiencia en la industria turística, nos hemos consolidado como líderes en servicios de viaje personalizados.
              </p>
              <p className="mb-4">
                Nuestro compromiso es brindar un servicio excepcional, cuidando cada detalle de tu viaje desde la planificación hasta el regreso a casa. Creemos que cada viaje debe ser único y memorable, adaptándose a las necesidades y sueños de cada viajero.
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Vuelos de Primera Clase
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Hoteles Seleccionados
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Alojamientos 5 Estrellas
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Vehículos de Última Generación
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    150+ Tours Premium
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Servicio 24/7
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-primary py-3 px-5 mt-2"
                onClick={() => {
                  // TODO: Implementar navegación a más información
                  alert('Más información próximamente');
                }}
              >
                Leer Más
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Team Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Nuestro Equipo
            </h6>
            <h1 className="mb-5">Conoce a Nuestros Expertos</h1>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="team-item">
                <div className="overflow-hidden">
                  <img 
                    className="img-fluid" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Director Ejecutivo" 
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="https://facebook.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://twitter.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://instagram.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Carlos Mendoza</h5>
                  <small>Director Ejecutivo</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="team-item">
                <div className="overflow-hidden">
                  <img 
                    className="img-fluid" 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Directora de Operaciones" 
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="https://facebook.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://twitter.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://instagram.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">María González</h5>
                  <small>Directora de Operaciones</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="team-item">
                <div className="overflow-hidden">
                  <img 
                    className="img-fluid" 
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Jefe de Guías Turísticos" 
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="https://facebook.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://twitter.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://instagram.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Alejandro Torres</h5>
                  <small>Jefe de Guías Turísticos</small>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.7s">
              <div className="team-item">
                <div className="overflow-hidden">
                  <img 
                    className="img-fluid" 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                    alt="Especialista en Experiencias" 
                  />
                </div>
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ marginTop: "-19px" }}
                >
                  <a className="btn btn-square mx-1" href="https://facebook.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://twitter.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter" />
                  </a>
                  <a className="btn btn-square mx-1" href="https://instagram.com/turisnow" target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram" />
                  </a>
                </div>
                <div className="text-center p-4">
                  <h5 className="mb-0">Isabella Ramírez</h5>
                  <small>Especialista en Experiencias</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Team End */}
    </div>
  );
};

export default About;