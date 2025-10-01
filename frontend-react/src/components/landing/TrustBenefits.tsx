import React from 'react';

const TrustBenefits: React.FC = () => (
  <div className="container pb-5">
    <h2 className="h4 mb-4 text-primary">Beneficios y confianza</h2>
    <div className="row g-4">
      {[
        { icon: '🔐', title: 'Pago seguro', text: 'Operamos con medios confiables.' },
        { icon: '👀', title: 'Cupos visibles', text: 'Transparencia en la disponibilidad.' },
        { icon: '📱', title: 'Ticket QR', text: 'Acceso rápido y sin papeles.' },
        { icon: '🧑‍💬', title: 'Soporte', text: 'Acompañamiento cercano.' },
      ].map(b => (
        <div className="col-6 col-md-3" key={b.title}>
          <div className="p-3 bg-white shadow-sm h-100 rounded text-center">
            <div className="display-6">{b.icon}</div>
            <h6 className="mt-2 mb-1">{b.title}</h6>
            <p className="small mb-0 text-muted">{b.text}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrustBenefits;
