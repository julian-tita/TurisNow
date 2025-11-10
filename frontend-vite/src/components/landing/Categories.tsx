import { Link } from 'react-router-dom';
import type { Categoria } from '../../types/experiencia.types';
import { CategoriaMeta } from '../../types/experiencia.types';

const categorias: Categoria[] = ['AVENTURA', 'CULTURA', 'GASTRONOMIA', 'PLAYA'];

export default function Categories() {
  return (
    <section className="container py-5">
      <h2 className="h4 mb-3">Explorá por categoría</h2>
      <div className="row g-3 row-cols-2 row-cols-md-4">
        {categorias.map((cat) => {
          const meta = CategoriaMeta[cat];
          return (
            <div className="col" key={cat}>
              <Link className="card h-100 text-decoration-none" to={`/experiencias?categoria=${cat}`}>
                <div className="ratio ratio-4x3">
                  <img 
                    className="card-img-top object-fit-cover" 
                    src={`https://picsum.photos/seed/${cat}/400/300`} 
                    alt={meta.label}
                  />
                </div>
                <div className="card-body">
                  <span className="stretched-link fw-semibold">
                    <i className={`fas ${meta.icon} me-2`}></i>
                    {meta.label}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
