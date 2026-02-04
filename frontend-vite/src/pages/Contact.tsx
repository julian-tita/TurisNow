import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    // TODO: Send form data to backend API endpoint
    // Example: POST /api/contact or similar
    console.log('Form submitted:', formData);

    // Show success message
    toast.success('¡Gracias! Tu mensaje ha sido enviado. Nos comunicaremos contigo en 24-48 horas.');

    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div style={{ paddingTop: '120px' }}>
      {/* Hero Header */}
      <div className="container-fluid bg-primary py-5 mb-5 hero-header">
        <div className="container py-5">
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white animated slideInDown">
                Contáctanos
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
                    Contáctanos
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            {/* Left Column - Text & Info */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.1s">
              <div>
                <h2 className="mb-4">Ponte en Contacto</h2>
                <p className="mb-4 fs-5">
                  ¿Tienes una pregunta o necesitas ayuda planificando tu próxima experiencia? Envíanos un mensaje y nos comunicaremos contigo lo antes posible. ¡Estamos aquí para ayudarte!
                </p>

                {/* Contact Info Box */}
                <div 
                  className="p-4 mb-5" 
                  style={{ backgroundColor: '#f8f9fa', borderLeft: '4px solid #0d6efd' }}
                >
                  <div className="mb-3">
                    <h6 className="text-primary mb-2">
                      <i className="fa fa-envelope me-2" />
                      Correo Electrónico
                    </h6>
                    <p className="mb-0">
                      <a href="mailto:support@turisnow.com" className="text-decoration-none">
                        support@turisnow.com
                      </a>
                    </p>
                  </div>
                  <div>
                    <h6 className="text-primary mb-2">
                      <i className="fa fa-clock me-2" />
                      Tiempo de Respuesta
                    </h6>
                    <p className="mb-0">
                      Dentro de 24–48 horas
                    </p>
                  </div>
                </div>

                {/* Illustration */}
                <div className="position-relative" style={{ minHeight: 300 }}>
                  <img
                    className="img-fluid"
                    src="https://images.unsplash.com/photo-1516321318423-f06f70504ab9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                    alt="Contáctanos - Equipo de soporte de TurisNow"
                    style={{ objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <div 
                className="p-5" 
                style={{ 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <h3 className="mb-4">Envíanos un Mensaje</h3>
                
                <form onSubmit={handleSubmit} noValidate>
                  {/* First Name */}
                  <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">
                      Nombre <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Juan"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Apellido <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="García"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Correo Electrónico <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="juan@ejemplo.com"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      Asunto
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Ej. Pregunta sobre experiencias"
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label">
                      Mensaje <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos qué está en tu mente..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    className="btn btn-primary py-3 px-5 w-100"
                  >
                    <i className="fa fa-paper-plane me-2" />
                    Enviar Mensaje
                  </button>
                </form>

                <p className="text-muted text-center mt-3 mb-0">
                  <small>Respetamos tu privacidad. Tus datos no serán compartidos.</small>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Contact Section End */}

    </div>
  );
};

export default Contact;
