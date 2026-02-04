import React from 'react';

const About: React.FC = () => {
  return (
    <div style={{ paddingTop: '120px' }}>
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
                  src="https://www.infobae.com/resizer/v2/https%3A%2F%2Fs3.amazonaws.com%2Farc-wordpress-client-uploads%2Finfobae-wp%2Fwp-content%2Fuploads%2F2017%2F07%2F31141652%2Fvacaciones-1920-1.jpg?auth=39a1b9baab489c689f78c5eb297678f61d9fdaac13521294c900f57f6dbcce41&smart=true&width=992&height=557&quality=85"
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
                En TurisNow, creamos una plataforma simple y segura para que descubras experiencias turísticas únicas. Conectamos viajeros curiosos con propuestas auténticas, facilitando la exploración y la planificación de viajes memorables de forma rápida e intuitiva.
              </p>
              <p className="mb-4">
                Nuestro objetivo es acompañarte en cada paso: desde explorar nuevas experiencias, armar tu itinerario personalizado, hasta confirmar tu reserva con total confianza. Queremos que tu experiencia en TurisNow sea transparente, segura y emocionante.
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Exploración de Experiencias
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Itinerarios Personalizados
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Recomendaciones Inteligentes
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Pagos Seguros
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Soporte 24/7
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2" />
                    Comunidad de Viajeros
                  </p>
                </div>
              </div>
              <button 
                className="btn btn-primary py-3 px-5 mt-2"
                onClick={() => {
                  window.location.href = '/experiencias';
                }}
              >
                Explorar Experiencias
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Mission Start */}
      <div className="container-xxl py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">
              Nuestra Visión
            </h6>
            <h1 className="mb-5">Impulsando la Exploración del Mundo</h1>
          </div>
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <h4 className="mb-3">Nuestra Misión</h4>
              <p className="mb-4">
                Conectar viajeros con experiencias auténticas, eliminando barreras y simplificando la forma en que descubrimos, planificamos y disfrutamos nuestras aventuras. Creemos que viajar nos enriquece, y nuestra misión es hacerlo más accesible para todos.
              </p>
              <p>
                Cada experiencia en TurisNow está curada para ofrecer valor genuino: propuestas reales, precios justos y una comunidad de viajeros que comparte el mismo espíritu explorador.
              </p>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h4 className="mb-3">¿Cómo Funciona?</h4>
              <div className="mb-4">
                <div style={{ display: 'flex', gap: '15px' }} className="mb-3">
                  <div style={{ minWidth: '40px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', width: '40px', height: '40px', backgroundColor: '#0d6efd', color: 'white', borderRadius: '50%', lineHeight: '40px', fontWeight: 'bold' }}>1</span>
                  </div>
                  <div>
                    <h5>Explora</h5>
                    <p className="mb-0">Descubre experiencias filtrando por interés, ubicación, fecha y presupuesto. Visualiza fotos, reseñas y detalles completos.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }} className="mb-3">
                  <div style={{ minWidth: '40px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', width: '40px', height: '40px', backgroundColor: '#0d6efd', color: 'white', borderRadius: '50%', lineHeight: '40px', fontWeight: 'bold' }}>2</span>
                  </div>
                  <div>
                    <h5>Planifica</h5>
                    <p className="mb-0">Crea un itinerario personalizado agregando experiencias, guardando favoritos y armando tu viaje ideal con datos e información útil.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ minWidth: '40px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', width: '40px', height: '40px', backgroundColor: '#0d6efd', color: 'white', borderRadius: '50%', lineHeight: '40px', fontWeight: 'bold' }}>3</span>
                  </div>
                  <div>
                    <h5>Disfruta</h5>
                    <p className="mb-0">Reserva con seguridad, recibe confirmación al instante y comienza tu aventura con total tranquilidad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mission End */}

      {/* CTA Section Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <h2 className="mb-4">¿Listo para tu Próxima Aventura?</h2>
              <p className="mb-4">
                Explora miles de experiencias, crea tu itinerario personalizado y comienza a planificar viajes memorables. TurisNow te acompaña en cada paso del camino.
              </p>
              <div className="d-flex gap-3">
                <a 
                  href="/experiencias" 
                  className="btn btn-primary py-3 px-5"
                >
                  <i className="fa fa-arrow-right me-2" />
                  Explorar Ahora
                </a>
                <a 
                  href="/itinerario" 
                  className="btn btn-outline-primary py-3 px-5"
                >
                  <i className="fa fa-calendar me-2" />
                  Crear Itinerario
                </a>
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s" style={{ textAlign: 'center' }}>
              <i className="fa fa-plane fa-5x text-primary opacity-10" style={{ display: 'block', marginBottom: '20px' }}></i>
              <p className="text-muted">
                <small>Únete a nuestra comunidad de viajeros exploradores. Tu próximo destino te espera.</small>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section End */}
    </div>
  );
};

export default About;