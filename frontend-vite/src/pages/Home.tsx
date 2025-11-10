import { useEffect, useState, useMemo } from 'react';
import Hero from "../components/landing/Hero";
import CategoryStrip from "../components/landing/CategoryStrip";
import HowItWorks from "../components/landing/HowItWorks";
import TrustBenefits from "../components/landing/TrustBenefits";
import { experienciaService } from "../services/experienciaService";
import type { ExperienciaListadoDTO } from "../types/experiencia.types";
import { Link } from 'react-router-dom';

// Helpers locales
const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const pickFeatured = (exps: ExperienciaListadoDTO[], n = 4): ExperienciaListadoDTO[] => {
  if (!exps.length) return [];
  // Tomar las primeras n experiencias de la respuesta
  // En una implementación futura, el backend podría tener un flag "destacada"
  return exps.slice(0, n);
};

// Componente Newsletter mantenido aquí por simplicidad

const Newsletter = () => (
  <div className="container-xxl bg-light py-5">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-7 text-center">
          <h3 className="mb-3">Recibí novedades</h3>
            <p className="text-muted mb-4">Suscribite para enterarte de nuevas experiencias y salidas recientes.</p>
            <div className="position-relative w-100 mt-3">
              <input className="form-control w-100 py-3 ps-4 pe-5" type="email" placeholder="Tu email" />
              <button type="button" className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">Enviar</button>
            </div>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton simple
const SkeletonCard = () => (
  <div className="placeholder-glow p-3 border rounded h-100">
    <div className="placeholder col-12 mb-3" style={{height: 120}}></div>
    <div className="placeholder col-8 mb-2"></div>
    <div className="placeholder col-5 mb-2"></div>
    <div className="placeholder col-6"></div>
  </div>
);

export default function Home() {
  const [items, setItems] = useState<ExperienciaListadoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    const loadExperiencias = async () => {
      try {
        setLoading(true);
        setError(null);
        const experiencias = await experienciaService.getExperienciasDestacadas(8);
        if (active) {
          setItems(experiencias);
        }
      } catch (err) {
        if (active) {
          setError('Error al cargar las experiencias');
          console.error('Error cargando experiencias:', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadExperiencias();
    return () => { active = false; };
  }, []);

  const featured = useMemo(() => pickFeatured(items, 4), [items]);

  return (
    <div>
      <Hero />
      <CategoryStrip />
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 m-0">Destacadas</h2>
          <Link to="/experiencias" className="btn btn-sm btn-outline-primary">Ver todas</Link>
        </div>
        <div className="row g-4">
          {loading && Array.from({length:4}).map((_,i)=>(<div className="col-6 col-md-4 col-lg-3" key={i}><SkeletonCard/></div>))}
          {error && (
            <div className="col-12">
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          )}
          {!loading && !error && featured.map((exp: ExperienciaListadoDTO) => (
            <div className="col-6 col-md-4 col-lg-3" key={exp.id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="ratio ratio-4x3 bg-light" style={{backgroundImage:`url(${exp.imagenUrl})`, backgroundSize:'cover', backgroundPosition:'center'}}></div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1 text-truncate" title={exp.titulo}>{exp.titulo}</h6>
                  <small className="text-muted d-block mb-2">{exp.ubicacion.ciudad}</small>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-primary small">{formatPrice(exp.precio, exp.moneda)}</span>
                    <Link to={`/experiencias/${exp.id}`} className="btn btn-sm btn-outline-primary">Ver</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de próximas salidas comentada temporalmente - requiere endpoint específico */}
      {/*
      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 m-0">Próximas salidas con cupo</h2>
        </div>
        <div className="row g-4">
          {loading && Array.from({length:6}).map((_,i)=>(<div className="col-12 col-md-6 col-lg-4" key={i}><SkeletonCard/></div>))}
          {!loading && <p className="text-muted small">No hay salidas próximas con cupos.</p>}
        </div>
      </div>
      */}

      <HowItWorks />
      <TrustBenefits />
      <Newsletter />
    </div>
  );
}
