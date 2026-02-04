import React from 'react';

const Privacy: React.FC = () => {
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
                Privacy Policy
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
                    Política de Privacidad
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
                En TurisNow ("nosotros", "nuestro" o "la Plataforma"), nos comprometemos a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, utilizamos, protegemos y compartimos tu información personal cuando utilizas nuestro sitio web y servicios.
              </p>

              {/* Table of Contents */}
              <div className="mb-5 p-4" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd', borderRadius: '4px' }}>
                <h6 className="mb-3 text-primary">Contenidos:</h6>
                <ul className="mb-0" style={{ paddingLeft: '20px' }}>
                  <li><a href="#alcance" className="text-decoration-none">Alcance</a></li>
                  <li><a href="#datos" className="text-decoration-none">Datos que recopilamos</a></li>
                  <li><a href="#finalidades" className="text-decoration-none">Finalidades de uso</a></li>
                  <li><a href="#base-legal" className="text-decoration-none">Base legal</a></li>
                  <li><a href="#cookies" className="text-decoration-none">Cookies</a></li>
                  <li><a href="#terceros" className="text-decoration-none">Compartición con terceros</a></li>
                  <li><a href="#seguridad" className="text-decoration-none">Seguridad</a></li>
                  <li><a href="#conservacion" className="text-decoration-none">Conservación de datos</a></li>
                  <li><a href="#derechos" className="text-decoration-none">Derechos del usuario</a></li>
                  <li><a href="#contacto" className="text-decoration-none">Contacto</a></li>
                </ul>
              </div>

              {/* Section 1 */}
              <h2 id="alcance" className="mb-4 mt-5">1. Alcance</h2>
              <p className="mb-4">
                Esta Política de Privacidad aplica al sitio web www.turisnow.com, la aplicación móvil de TurisNow y todos los servicios relacionados (colectivamente, "TurisNow"). Al acceder o utilizar TurisNow, aceptas las prácticas descritas en esta política.
              </p>

              {/* Section 2 */}
              <h2 id="datos" className="mb-4 mt-5">2. Datos que recopilamos</h2>
              <p className="mb-3">Recopilamos información en las siguientes categorías:</p>
              <ul className="mb-4">
                <li className="mb-2"><strong>Datos de Cuenta:</strong> Nombre completo, correo electrónico, número de teléfono (opcional), foto de perfil (opcional).</li>
                <li className="mb-2"><strong>Datos de Contacto:</strong> Dirección, ciudad, país, código postal cuando realizas una reserva o actualizas tu perfil.</li>
                <li className="mb-2"><strong>Datos de Reservas e Itinerarios:</strong> Experiencias guardadas, itinerarios creados, preferencias de viaje, historial de búsquedas.</li>
                <li className="mb-2"><strong>Datos de Navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, duración de las sesiones, cookies de seguimiento (analytics).</li>
                <li className="mb-2"><strong>Datos de Pago (si aplica):</strong> Información procesada únicamente por proveedores de pago autorizados; TurisNow NO almacena números de tarjeta completos.</li>
              </ul>

              {/* Section 3 */}
              <h2 id="finalidades" className="mb-4 mt-5">3. Finalidades de uso</h2>
              <p className="mb-3">Utilizamos tus datos personales para:</p>
              <ul className="mb-4">
                <li className="mb-2">Operar y mantener la Plataforma.</li>
                <li className="mb-2">Crear y gestionar tu cuenta de usuario.</li>
                <li className="mb-2">Procesar tus reservas e itinerarios.</li>
                <li className="mb-2">Proporcionar soporte técnico y atención al cliente.</li>
                <li className="mb-2">Enviar notificaciones, confirmaciones y actualizaciones sobre tu cuenta.</li>
                <li className="mb-2">Mejorar y personalizar la experiencia del usuario.</li>
                <li className="mb-2">Realizar análisis y métricas anónimas para entender cómo se utiliza TurisNow.</li>
                <li className="mb-2">Cumplir con obligaciones legales y normativas.</li>
                <li className="mb-2">Detectar y prevenir fraude o uso indebido.</li>
              </ul>

              {/* Section 4 */}
              <h2 id="base-legal" className="mb-4 mt-5">4. Base legal y marco normativo</h2>
              <p className="mb-4">
                El tratamiento de tus datos personales se realiza conforme a la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina y sus decretos reglamentarios. Asimismo, cumplimos con buenas prácticas internacionales en protección de datos y privacidad. El fundamento legal para el tratamiento es tu consentimiento al aceptar esta política y/o la ejecución del servicio que has solicitado.
              </p>

              {/* Section 5 */}
              <h2 id="cookies" className="mb-4 mt-5">5. Cookies</h2>
              <p className="mb-4">
                TurisNow utiliza cookies para mejorar tu experiencia. Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo. Utilizamos cookies para:
              </p>
              <ul className="mb-4">
                <li className="mb-2">Recordar tus preferencias de sesión.</li>
                <li className="mb-2">Analizar el comportamiento del usuario (Google Analytics u similar).</li>
                <li className="mb-2">Personalizar contenido.</li>
              </ul>
              <p className="mb-4">
                Puedes deshabilitar las cookies desde la configuración de tu navegador. Sin embargo, esto puede afectar la funcionalidad de TurisNow. Al continuar usando TurisNow, reconoces el uso de cookies.
              </p>

              {/* Section 6 */}
              <h2 id="terceros" className="mb-4 mt-5">6. Compartición con terceros</h2>
              <p className="mb-3">
                Podemos compartir tus datos personales con:
              </p>
              <ul className="mb-4">
                <li className="mb-2"><strong>Proveedores técnicos:</strong> Hosting, almacenamiento en la nube, servicios de email (Sendgrid, Mailgun, etc.).</li>
                <li className="mb-2"><strong>Procesadores de pago:</strong> Mercado Pago, Stripe u otros (solo si realizas pagos a través de TurisNow).</li>
                <li className="mb-2"><strong>Organizadores/Proveedores de experiencias:</strong> Tu nombre y correo pueden compartirse con el organizador de la experiencia que reservaste.</li>
                <li className="mb-2"><strong>Cumplimiento legal:</strong> Si lo requiere una corte, autoridad gubernamental u orden legal.</li>
              </ul>
              <p className="mb-4">
                <strong>No vendemos ni alquilamos tus datos personales a terceros con fines comerciales.</strong>
              </p>

              {/* Section 7 */}
              <h2 id="seguridad" className="mb-4 mt-5">7. Seguridad</h2>
              <p className="mb-4">
                TurisNow implementa medidas técnicas y organizativas razonables para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Estas incluyen cifrado HTTPS, autenticación de contraseña y auditorías periódicas. <strong>Sin embargo, no podemos garantizar seguridad absoluta.</strong> No somos responsables por brechas de seguridad derivadas de causas ajenas a nuestro control razonable.
              </p>

              {/* Section 8 */}
              <h2 id="conservacion" className="mb-4 mt-5">8. Conservación de datos</h2>
              <p className="mb-4">
                Conservamos tus datos personales mientras tu cuenta esté activa. Si desactivas tu cuenta, conservaremos datos anónimos o agregados para análisis y cumplimiento legal. En caso de cierre de cuenta, reteneremos información durante el período requerido por ley (típicamente 3-5 años) para auditoría y cumplimiento normativo.
              </p>

              {/* Section 9 */}
              <h2 id="derechos" className="mb-4 mt-5">9. Derechos del usuario</h2>
              <p className="mb-3">
                Conforme a la Ley 25.326, tienes derecho a:
              </p>
              <ul className="mb-4">
                <li className="mb-2"><strong>Acceso:</strong> Solicitar copia de tus datos personales.</li>
                <li className="mb-2"><strong>Rectificación:</strong> Corregir información inexacta.</li>
                <li className="mb-2"><strong>Actualización:</strong> Mantener tus datos vigentes.</li>
                <li className="mb-2"><strong>Supresión:</strong> Solicitar eliminar tus datos (sujeto a retención legal).</li>
              </ul>
              <p className="mb-4">
                Para ejercer estos derechos, contáctanos en <a href="mailto:privacidad@turisnow.com" className="text-primary text-decoration-none">privacidad@turisnow.com</a> con tu solicitud detallada. Responderemos dentro de 10 días hábiles.
              </p>
              <div className="p-4 mb-4" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107', borderRadius: '4px' }}>
                <p className="mb-0 small">
                  <strong>Autoridad de control:</strong> En caso de reclamo sobre el tratamiento de tus datos, puedes contactar a la <strong>Dirección Nacional de Protección de Datos Personales (DNPDP)</strong>, dependiente de la Agencia de Acceso a la Información Pública. Correo: <a href="mailto:dnpdp@aaip.gob.ar">dnpdp@aaip.gob.ar</a>
                </p>
              </div>

              {/* Section 10 */}
              <h2 id="contacto" className="mb-4 mt-5">10. Contacto</h2>
              <p className="mb-4">
                Si tienes preguntas sobre esta Política de Privacidad, deseas ejercer tus derechos o reportar un problema, contáctanos:
              </p>
              <div className="p-4 mb-5" style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd', borderRadius: '4px' }}>
                <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacidad@turisnow.com" className="text-primary text-decoration-none">privacidad@turisnow.com</a></p>
                <p className="mb-0"><strong>Empresa:</strong> TurisNow S.A.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
