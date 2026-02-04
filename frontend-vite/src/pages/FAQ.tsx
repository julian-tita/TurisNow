import React from 'react';

const FAQ: React.FC = () => {
  const faqItems = [
    {
      id: 'faq1',
      question: '¿Qué es TurisNow?',
      answer: 'TurisNow es una plataforma para explorar experiencias turísticas y armar itinerarios en un solo lugar. Podés guardar ideas, comparar opciones y planificar tu viaje de forma simple.',
    },
    {
      id: 'faq2',
      question: '¿Necesito crear una cuenta para usar TurisNow?',
      answer: 'No para explorar. Para guardar favoritos, armar itinerarios o gestionar tus datos, es posible que se requiera registrarse (según las funciones habilitadas en la versión actual).',
    },
    {
      id: 'faq3',
      question: '¿Cómo armo mi itinerario?',
      answer: 'Elegí experiencias, agregalas a tu itinerario y organizalas por día/horario. Luego podés editarlo cuando quieras desde la sección "Itinerario".',
    },
    {
      id: 'faq4',
      question: '¿TurisNow vende las experiencias o es un intermediario?',
      answer: 'TurisNow facilita el descubrimiento y la organización. La disponibilidad, precios y condiciones pueden depender del proveedor/organizador de cada experiencia.',
    },
    {
      id: 'faq5',
      question: '¿Los precios y la disponibilidad están siempre actualizados?',
      answer: 'Intentamos mostrar información lo más actual posible, pero puede haber cambios de último momento. Te recomendamos confirmar disponibilidad y condiciones al momento de reservar.',
    },
    {
      id: 'faq6',
      question: '¿Qué pasa si necesito cancelar o reprogramar?',
      answer: 'Las políticas de cancelación/reembolso dependen de cada experiencia o proveedor. Cuando estén disponibles, las vas a ver informadas antes de confirmar una reserva.',
    },
    {
      id: 'faq7',
      question: '¿Cómo me contacto con soporte?',
      answer: 'Podés escribirnos desde la página "Contáctanos". Si tu consulta es urgente, indicá el motivo y te responderemos a la brevedad dentro del horario de atención.',
    },
    {
      id: 'faq8',
      question: '¿Mis datos están protegidos?',
      answer: 'Sí. Usamos medidas de seguridad razonables y tratamos los datos según buenas prácticas y normativa aplicable en Argentina. Para más detalles, consultá "Política de Privacidad".',
    },
    {
      id: 'faq9',
      question: '¿TurisNow funciona desde el celular?',
      answer: 'Sí, el sitio es responsive y se adapta a pantallas móviles y tablets.',
    },
    {
      id: 'faq10',
      question: '¿Puedo recomendar o publicar una experiencia?',
      answer: 'Si sos proveedor/organizador, podés contactarnos para evaluar el alta de experiencias (funcionalidad sujeta a la etapa del proyecto).',
    },
  ];

  return (
    <div style={{ paddingTop: '120px' }}>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Preguntas Frecuentes
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
                    Preguntas Frecuentes
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto wow fadeInUp" data-wow-delay="0.1s">
              
              {/* Intro Text */}
              <p className="mb-5 text-center text-muted">
                Aquí encontrarás respuestas a las preguntas más comunes sobre TurisNow. 
                Si no encuentras lo que buscas, podés contactarnos desde la página <a href="/contact" className="text-primary text-decoration-none">Contáctanos</a>.
              </p>

              {/* Bootstrap Accordion */}
              <div className="accordion accordion-flush" id="faqAccordion">
                {faqItems.map((item, index) => (
                  <div className="accordion-item mb-3" key={item.id} style={{ border: '1px solid #dee2e6', borderRadius: '4px' }}>
                    <h2 className="accordion-header" id={`heading${item.id}`}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${item.id}`}
                        aria-expanded="false"
                        aria-controls={`collapse${item.id}`}
                        style={{
                          fontWeight: '500',
                          color: '#0d6efd',
                          padding: '1rem',
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${item.id}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${item.id}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div
                        className="accordion-body"
                        style={{
                          padding: '1.5rem',
                          backgroundColor: '#ffffff',
                          color: '#495057',
                          lineHeight: '1.6',
                        }}
                      >
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact CTA */}
              <div
                className="mt-5 p-4 text-center"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  borderLeft: '4px solid #0d6efd',
                }}
              >
                <h5 className="mb-3">¿No encontraste lo que buscas?</h5>
                <p className="mb-4">
                  Estamos aquí para ayudarte. Contactanos y te responderemos a la brevedad.
                </p>
                <a href="/contact" className="btn btn-primary">
                  Envía tu consulta
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
