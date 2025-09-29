import React from 'react';
import Hero from "../components/landing/Hero";
import Categories from "../components/landing/Categories";
import Featured from "../components/landing/Featured";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* About Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="position-relative h-100">
                <img 
                  className="img-fluid position-absolute w-100 h-100" 
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Acerca de TurisNow" 
                  style={{objectFit: 'cover'}} 
                />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className="section-title bg-white text-start text-primary pe-3">Acerca de Nosotros</h6>
              <h1 className="mb-4">Bienvenido a <span className="text-primary">TurisNow</span></h1>
              <p className="mb-4">
                En TurisNow, creemos que cada viaje es una oportunidad única para crear recuerdos inolvidables. 
                Somos expertos en diseñar experiencias de viaje personalizadas que se adaptan a tus gustos y presupuesto.
              </p>
              <p className="mb-4">
                Desde aventuras extremas hasta escapadas románticas, nuestro equipo de especialistas en turismo 
                está comprometido en hacer que tu próximo viaje sea extraordinario.
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Vuelos de Primera Clase</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Hoteles 5 Estrellas</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>150 Servicios Premium</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Guías Especializados</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Atención 24/7</p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0"><i className="fa fa-arrow-right text-primary me-2"></i>Seguro de Viaje</p>
                </div>
              </div>
              <a className="btn btn-primary py-3 px-5 mt-2" href="/about">Leer Más</a>
            </div>
          </div>
        </div>
      </div>
      {/* About End */}

      {/* Service Start */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className="section-title bg-white text-center text-primary px-3">Servicios</h6>
            <h1 className="mb-5">Nuestros Servicios</h1>
          </div>
          <div className="row g-4">
            <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.1s">
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-globe text-primary mb-4"></i>
                  <h5>Guías Mundiales</h5>
                  <p>Descubre el mundo con nuestros guías expertos en destinos internacionales</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-hotel text-primary mb-4"></i>
                  <h5>Reservas de Hotel</h5>
                  <p>Los mejores hoteles y alojamientos seleccionados especialmente para ti</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-user text-primary mb-4"></i>
                  <h5>Guías de Viaje</h5>
                  <p>Guías locales certificados que conocen cada rincón de tu destino</p>
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
              <div className="service-item rounded pt-3">
                <div className="p-4">
                  <i className="fa fa-3x fa-cog text-primary mb-4"></i>
                  <h5>Gestión de Eventos</h5>
                  <p>Organizamos bodas, conferencias y eventos especiales en destinos únicos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Service End */}

      {/* Categories Section */}
      <Categories />

      {/* Featured Section */}
      <Featured />

      {/* Newsletter Start */}
      <div className="container-xxl bg-primary newsletter py-5 wow fadeInUp" data-wow-delay="0.1s">
        <div className="container py-5 px-lg-5">
          <div className="row justify-content-center">
            <div className="col-lg-7 text-center">
              <h3 className="text-white mb-4">Suscríbete a Nuestro Newsletter</h3>
              <p className="text-white mb-4">
                Mantente al día con las mejores ofertas, destinos exclusivos y consejos de viaje. 
                Suscríbete y recibe descuentos especiales directamente en tu email.
              </p>
              <div className="position-relative w-100 mt-3">
                <input className="form-control bg-transparent w-100 py-3 ps-4 pe-5" type="email" placeholder="Tu Email" />
                <button type="button" className="btn btn-dark py-2 position-absolute top-0 end-0 mt-2 me-2">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Newsletter End */}
    </div>
  );
}
