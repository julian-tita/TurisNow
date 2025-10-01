import React, { useEffect, useState, useMemo } from 'react';
import Hero from "../components/landing/Hero";
import CategoryStrip from "../components/landing/CategoryStrip";
import FeaturedGrid from "../components/landing/FeaturedGrid";
import UpcomingDepartures from "../components/landing/UpcomingDepartures";
import HowItWorks from "../components/landing/HowItWorks";
import TrustBenefits from "../components/landing/TrustBenefits";
import { getExperiences } from "../data/experiences";
import { Experience, Departure } from "../types/experience";
import { Link } from 'react-router-dom';

// Helpers locales
const formatPrice = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

const pickFeatured = (exps: Experience[], n = 6): Experience[] => {
  if (!exps.length) return [];
  // Ordenar por precio ascendente y tomar primeros n (podría hacerse aleatorio)
  return [...exps].sort((a, b) => a.price - b.price).slice(0, n);
};

interface UpcomingItem {
  departure: Departure;
  experience: Experience;
}

const pickUpcomingDepartures = (exps: Experience[], n = 6): UpcomingItem[] => {
  const now = new Date();
  const list: UpcomingItem[] = [];
  exps.forEach(exp => {
    exp.departures.forEach(dep => {
      const start = new Date(dep.startAt);
      if (start > now && dep.capacityLeft > 0) {
        list.push({ departure: dep, experience: exp });
      }
    });
  });
  return list
    .sort((a, b) => new Date(a.departure.startAt).getTime() - new Date(b.departure.startAt).getTime())
    .slice(0, n);
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
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getExperiences(400).then(data => { if (active) { setItems(data); setLoading(false); } });
    return () => { active = false; };
  }, []);

  const featured = useMemo(() => pickFeatured(items, 4), [items]);
  const upcoming = useMemo(() => pickUpcomingDepartures(items, 6), [items]);

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
          {!loading && featured.map(exp => (
            <div className="col-6 col-md-4 col-lg-3" key={exp.id}>
              <div className="card h-100 shadow-sm border-0">
                <div className="ratio ratio-4x3 bg-light" style={{backgroundImage:`url(${exp.mainImageUrl})`, backgroundSize:'cover', backgroundPosition:'center'}}></div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mb-1 text-truncate" title={exp.title}>{exp.title}</h6>
                  <small className="text-muted d-block mb-2">{exp.location.city}</small>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="fw-semibold text-primary small">{formatPrice(exp.price, exp.currency)}</span>
                    <Link to={`/experiencias/${exp.id}`} className="btn btn-sm btn-outline-primary">Ver</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container pb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h4 m-0">Próximas salidas con cupo</h2>
        </div>
        <div className="row g-4">
          {loading && Array.from({length:6}).map((_,i)=>(<div className="col-12 col-md-6 col-lg-4" key={i}><SkeletonCard/></div>))}
          {!loading && upcoming.map(item => {
            const date = new Date(item.departure.startAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
            const few = item.departure.capacityLeft <= 3;
            return (
              <div className="col-12 col-md-6 col-lg-4" key={item.departure.id}>
                <div className="border rounded p-3 h-100 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h6 className="mb-1 text-truncate" title={item.experience.title}>{item.experience.title}</h6>
                      <small className="text-muted">{date}</small>
                    </div>
                    {few && <span className="badge bg-danger">Pocos lugares</span>}
                  </div>
                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Cupos: {item.departure.capacityLeft}/{item.departure.capacityTotal}</span>
                    <Link to={`/experiencias/${item.experience.id}`} className="btn btn-sm btn-primary">Ver</Link>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && upcoming.length === 0 && <p className="text-muted small">No hay salidas próximas con cupos.</p>}
        </div>
      </div>

      <HowItWorks />
      <TrustBenefits />
      <Newsletter />
    </div>
  );
}
