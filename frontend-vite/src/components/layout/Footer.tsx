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
            <div className="col-lg-4 col-md-6">
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
            <div className="col-lg-4 col-md-6">
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
            </div>
            <div className="col-lg-4 col-md-6">
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
          {/* Métodos de pago */}
          <div className="row py-4 border-top border-secondary">
            <div className="col-12 text-center">
              <h6 className="text-white mb-3">Métodos de Pago Aceptados</h6>
              <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
                <img 
                  src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg" 
                  alt="Mercado Pago" 
                  style={{ height: '30px', filter: 'brightness(0) invert(1)' }}
                />
                <span className="text-light">|</span>
                <i className="fab fa-cc-visa text-light" style={{ fontSize: '2rem' }}></i>
                <i className="fab fa-cc-mastercard text-light" style={{ fontSize: '2rem' }}></i>
                <i className="fab fa-cc-amex text-light" style={{ fontSize: '2rem' }}></i>
                <span className="text-light small">+ más opciones</span>
              </div>
              <p className="text-light small mt-2 mb-0">
                <i className="fa fa-lock me-1"></i>
                Pagos seguros procesados por Mercado Pago
              </p>
            </div>
          </div>

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