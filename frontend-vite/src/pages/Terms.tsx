import React from 'react';

const Terms: React.FC = () => {
  const currentDate = new Date();
  const lastUpdated = `${currentDate.toLocaleString('es-AR', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return (
    <div style={{ paddingTop: '120px' }}>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Terms & Conditions
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
                    Términos y Condiciones
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto wow fadeInUp" data-wow-delay="0.1s">
              
              {/* Last Updated */}
              <p className="text-muted mb-4">
                <small>Última actualización: {lastUpdated}</small>
              </p>

              {/* Introduction */}
              <p className="mb-4">
                Bienvenido a TurisNow. Estos Términos y Condiciones ("Términos") regulan tu acceso y uso de nuestro sitio web, aplicación móvil y servicios (colectivamente, "la Plataforma"). Al acceder o usar TurisNow, aceptas estar obligado por estos Términos.
              </p>

              {/* Table of Contents */}
              <div className="mb-5 p-4" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd', borderRadius: '4px' }}>
                <h6 className="mb-3 text-primary">Contenidos:</h6>
                <ul className="mb-0" style={{ paddingLeft: '20px' }}>
                  <li><a href="#aceptacion" className="text-decoration-none">Aceptación de Términos</a></li>
                  <li><a href="#servicio" className="text-decoration-none">Descripción del Servicio</a></li>
                  <li><a href="#registro" className="text-decoration-none">Registro y Cuenta</a></li>
                  <li><a href="#compras" className="text-decoration-none">Compras, Reservas y Pagos</a></li>
                  <li><a href="#cancelaciones" className="text-decoration-none">Cancelaciones y Reembolsos</a></li>
                  <li><a href="#conducta" className="text-decoration-none">Conducta del Usuario</a></li>
                  <li><a href="#propiedad" className="text-decoration-none">Propiedad Intelectual</a></li>
                  <li><a href="#limitacion" className="text-decoration-none">Limitación de Responsabilidad</a></li>
                  <li><a href="#enlaces" className="text-decoration-none">Enlaces a Terceros</a></li>
                  <li><a href="#modificaciones" className="text-decoration-none">Modificaciones de Términos</a></li>
                  <li><a href="#ley" className="text-decoration-none">Ley Aplicable</a></li>
                  <li><a href="#contacto" className="text-decoration-none">Contacto</a></li>
                </ul>
              </div>

              {/* Section 1 */}
              <h2 id="aceptacion" className="mb-4 mt-5">1. Aceptación de Términos</h2>
              <p className="mb-4">
                Al acceder a TurisNow, aceptas estos Términos y Condiciones así como nuestra Política de Privacidad. Si no estás de acuerdo con alguna disposición, por favor no utilices la Plataforma.
              </p>

              {/* Section 2 */}
              <h2 id="servicio" className="mb-4 mt-5">2. Descripción del Servicio</h2>
              <p className="mb-4">
                TurisNow es una plataforma digital que permite a los usuarios:
              </p>
              <ul className="mb-4">
                <li className="mb-2">Explorar y descubrir experiencias turísticas ofrecidas por terceros (organizadores/proveedores).</li>
                <li className="mb-2">Crear itinerarios personalizados agregando experiencias a un viaje.</li>
                <li className="mb-2">Realizar reservas de experiencias.</li>
                <li className="mb-2">Contactar con organizadores o proveedores de experiencias (si aplica).</li>
              </ul>
              <p className="mb-4">
                <strong>TurisNow actúa como intermediario facilitador entre usuarios y proveedores de experiencias.</strong> No somos proveedores directos de las experiencias ni somos responsables del desempeño, calidad, seguridad o cumplimiento de los proveedores.
              </p>

              {/* Section 3 */}
              <h2 id="registro" className="mb-4 mt-5">3. Registro y Cuenta</h2>
              <p className="mb-3">
                Para usar ciertas funciones de TurisNow, debes crear una cuenta:
              </p>
              <ul className="mb-4">
                <li className="mb-2">Eres responsable de mantener la confidencialidad de tus credenciales (usuario y contraseña).</li>
                <li className="mb-2">Debes proporcionar información veraz, actual y completa durante el registro.</li>
                <li className="mb-2">Eres responsable de toda actividad que ocurra en tu cuenta.</li>
                <li className="mb-2">Debes notificar inmediatamente a TurisNow si sospechas acceso no autorizado.</li>
              </ul>

              {/* Section 4 */}
              <h2 id="compras" className="mb-4 mt-5">4. Compras, Reservas y Pagos</h2>
              <p className="mb-3">
                Al realizar una reserva de experiencia:
              </p>
              <ul className="mb-4">
                <li className="mb-2"><strong>Precios:</strong> Los precios se muestran en la Plataforma y pueden variar sin previo aviso. Los impuestos y cargos adicionales se indicarán antes de confirmar la compra.</li>
                <li className="mb-2"><strong>Disponibilidad:</strong> Las experiencias se reservan sujeto a disponibilidad. TurisNow no garantiza que una experiencia estará disponible en una fecha específica.</li>
                <li className="mb-2"><strong>Confirmación:</strong> Recibirás una confirmación de reserva por correo electrónico. Esta confirmación no constituye aceptación del proveedor hasta que el proveedor la acepte formalmente.</li>
                <li className="mb-2"><strong>Pagos:</strong> Los pagos son procesados por proveedores terceros. TurisNow no almacena información de tarjeta completa. Aceptas los Términos de Servicio del procesador de pagos.</li>
                <li className="mb-2"><strong>Reembolsos:</strong> Las políticas de reembolso dependen del proveedor/organizador de la experiencia. Consulta la descripción de la experiencia para detalles específicos.</li>
              </ul>

              {/* Section 5 */}
              <h2 id="cancelaciones" className="mb-4 mt-5">5. Cancelaciones y Reembolsos</h2>
              <p className="mb-4">
                Las cancelaciones y reembolsos están sujetos a:
              </p>
              <ul className="mb-4">
                <li className="mb-2">La política de cancelación específica de cada experiencia/proveedor (mostrada en la página de detalle).</li>
                <li className="mb-2">TurisNow actúa como intermediario y no procesa reembolsos directamente; estos son manejados por el proveedor o procesador de pagos.</li>
                <li className="mb-2">Los reembolsos pueden demorar 5-10 días hábiles después de ser procesados por el proveedor.</li>
                <li className="mb-2">Si consideras que se produjo un error, contáctanos en soporte@turisnow.com para asistencia.</li>
              </ul>

              {/* Section 6 */}
              <h2 id="conducta" className="mb-4 mt-5">6. Conducta del Usuario</h2>
              <p className="mb-3">
                Al usar TurisNow, aceptas que NO:
              </p>
              <ul className="mb-4">
                <li className="mb-2">Utilizarás la Plataforma para actividades ilegales o no autorizadas.</li>
                <li className="mb-2">Participarás en fraude, estafas o prácticas engañosas.</li>
                <li className="mb-2">Publicarás contenido ofensivo, difamatorio, discriminatorio o que viole derechos de terceros.</li>
                <li className="mb-2">Intentarás acceder a sistemas sin autorización.</li>
                <li className="mb-2">Usarás bots o scripts automatizados (sin permiso).</li>
                <li className="mb-2">Spamearás o abusos contra otros usuarios.</li>
              </ul>

              {/* Section 7 */}
              <h2 id="propiedad" className="mb-4 mt-5">7. Propiedad Intelectual</h2>
              <p className="mb-4">
                El nombre "TurisNow", logotipo, diseño, funcionalidades, contenido y código fuente de la Plataforma son propiedad intelectual de TurisNow o sus licenciantes. Tienes permiso para usar la Plataforma para fines personales, no comerciales. No puedes reproducir, distribuir, modificar ni crear obras derivadas sin autorización expresa.
              </p>

              {/* Section 8 */}
              <h2 id="limitacion" className="mb-4 mt-5">8. Limitación de Responsabilidad</h2>
              <p className="mb-4">
                En la medida permitida por la ley, TurisNow:
              </p>
              <ul className="mb-4">
                <li className="mb-2">NO es responsable por el desempeño, calidad, seguridad o cumplimiento de los proveedores de experiencias o terceros.</li>
                <li className="mb-2">NO garantiza que la Plataforma funcionará sin interrupciones o errores.</li>
                <li className="mb-2">NO es responsable por daños indirectos, incidentales, especiales o punitivos derivados del uso de TurisNow.</li>
                <li className="mb-2">NO es responsable por eventos externos (cancelaciones de proveedores, cambios políticos, desastres naturales, etc.).</li>
              </ul>
              <p className="mb-4">
                La responsabilidad máxima de TurisNow se limita al monto que pagaste en la última transacción (o USD 100, lo que sea mayor).
              </p>

              {/* Section 9 */}
              <h2 id="enlaces" className="mb-4 mt-5">9. Enlaces a Terceros</h2>
              <p className="mb-4">
                TurisNow puede contener enlaces a sitios web de terceros. No controlamos, respaldamos ni asumimos responsabilidad por el contenido, políticas de privacidad o prácticas de esos sitios. El uso de enlaces es bajo tu propio riesgo.
              </p>

              {/* Section 10 */}
              <h2 id="modificaciones" className="mb-4 mt-5">10. Modificaciones de Términos</h2>
              <p className="mb-4">
                TurisNow puede actualizar estos Términos en cualquier momento. Los cambios serán publicados en esta página con una fecha de actualización. Tu uso continuado de la Plataforma después de cambios constituye aceptación de los nuevos Términos. Te recomendamos revisar esta página periódicamente.
              </p>

              {/* Section 11 */}
              <h2 id="ley" className="mb-4 mt-5">11. Ley Aplicable y Jurisdicción</h2>
              <p className="mb-4">
                Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>. Cualquier disputa, demanda o controversia que surja de estos Términos será resuelta ante los <strong>Juzgados Ordinarios de la Ciudad Autónoma de Buenos Aires</strong>, Argentina.
              </p>

              {/* Section 12 */}
              <h2 id="contacto" className="mb-4 mt-5">12. Contacto</h2>
              <p className="mb-4">
                Si tienes preguntas, reclamos o comentarios sobre estos Términos, contáctanos:
              </p>
              <div className="p-4 mb-5" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd', borderRadius: '4px' }}>
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:soporte@turisnow.com" className="text-primary text-decoration-none">soporte@turisnow.com</a></p>
                <p className="mb-2"><strong>Sitio Web:</strong> <a href="https://www.turisnow.com" className="text-primary text-decoration-none">www.turisnow.com</a></p>
                <p className="mb-0"><strong>Empresa:</strong> TurisNow S.A., Buenos Aires, Argentina</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
