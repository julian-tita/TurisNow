import React from 'react';

const Footer: React.FC = () => {
  return (
    <div>
      {/* Footer Start */}
      <div
        className="container-fluid bg-dark text-light footer pt-5 mt-5 wow fadeIn"
        data-wow-delay="0.1s"
      >
        <div className="container py-5">
          <div className="row g-5">
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-3">Empresa</h4>
              <a className="btn btn-link" href="/about">
                Nosotros
              </a>
              <a className="btn btn-link" href="/contact">
                Contáctanos
              </a>
              <a className="btn btn-link" href="/privacy">
                Política de Privacidad
              </a>
              <a className="btn btn-link" href="/terms">
                Términos y Condiciones
              </a>
              <a className="btn btn-link" href="/faq">
                Preguntas Frecuentes
              </a>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-3">Contacto</h4>
              <p className="mb-2">
                <i className="fa fa-map-marker-alt me-3" />
                Buenos Aires, Argentina
              </p>
              <p className="mb-2">
                <i className="fa fa-phone-alt me-3" />
                +54 11 4567-8900
              </p>
              <p className="mb-2">
                <i className="fa fa-envelope me-3" />
                info@turisnow.com
              </p>
              <div className="d-flex pt-2">
                <a className="btn btn-outline-light btn-social" href="https://twitter.com/turisnow" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-twitter" />
                </a>
                <a className="btn btn-outline-light btn-social" href="https://facebook.com/turisnow" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f" />
                </a>
                <a className="btn btn-outline-light btn-social" href="https://youtube.com/turisnow" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-youtube" />
                </a>
                <a className="btn btn-outline-light btn-social" href="https://linkedin.com/company/turisnow" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-3">Galería</h4>
              <div className="row g-2 pt-2">
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 1"
                  />
                </div>
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 2"
                  />
                </div>
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 3"
                  />
                </div>
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 4"
                  />
                </div>
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 5"
                  />
                </div>
                <div className="col-4">
                  <img
                    className="img-fluid bg-light p-1"
                    src="https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Destino 6"
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <h4 className="text-white mb-3">Newsletter</h4>
              <p>Suscríbete para recibir las mejores ofertas y noticias de viajes.</p>
              <div
                className="position-relative mx-auto"
                style={{ maxWidth: 400 }}
              >
                <input
                  className="form-control border-primary w-100 py-3 ps-4 pe-5"
                  type="email"
                  placeholder="Tu email"
                />
                <button
                  type="button"
                  className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
                >
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="copyright">
            <div className="row">
              <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
                ©{" "}
                <a className="border-bottom" href="/">
                  TurisNow
                </a>
                , Todos los derechos reservados.
                Diseñado por{" "}
                <a className="border-bottom" href="https://github.com/julian-tita">
                  TurisNow Team
                </a>
              </div>
              <div className="col-md-6 text-center text-md-end">
                <div className="footer-menu">
                  <a href="/">Inicio</a>
                  <a href="/privacy">Privacidad</a>
                  <a href="/help">Ayuda</a>
                  <a href="/faq">FAQ</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer End */}
    </div>
  );
};

export default Footer;