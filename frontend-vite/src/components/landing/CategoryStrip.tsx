import { Link } from 'react-router-dom';
import type { Categoria } from '../../types/experiencia.types';
import { CategoriaMeta } from '../../types/experiencia.types';

// Categorías con emojis y gradientes para el landing
const categoryVisuals: Record<Categoria, { emoji: string; gradient: string }> = {
	PLAYA: { emoji: '🏖️', gradient: 'linear-gradient(135deg,#56CCF2,#2F80ED)' },
	MONTANA: { emoji: '🏔️', gradient: 'linear-gradient(135deg,#89F7FE,#66A6FF)' },
	AVENTURA: { emoji: '🧗', gradient: 'linear-gradient(135deg,#F7971E,#FFD200)' },
	GASTRONOMIA: { emoji: '🍷', gradient: 'linear-gradient(135deg,#FF9A9E,#FECFEF)' },
	CULTURA: { emoji: '🏛️', gradient: 'linear-gradient(135deg,#43CBFF,#9708CC)' },
};

const categorias: Categoria[] = ['PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'];

export default function CategoryStrip() {
	return (
		<div className="container py-4">
			<h2 className="h5 mb-3">Explorar por categoría</h2>
			<div className="row g-3 justify-content-center">
				{categorias.map(cat => {
					const meta = CategoriaMeta[cat];
					const visual = categoryVisuals[cat];
					
					return (
						<div className="col-8 col-sm-5 col-md-3 col-lg-2 d-flex" key={cat}>
							<Link to={`/experiencias?categoria=${cat}`} className="text-decoration-none w-100">
								<div className="rounded shadow-sm text-center p-3 h-100 d-flex flex-column justify-content-center"
										 style={{background: visual.gradient, color: '#fff', minHeight: 110}}>
									<div style={{fontSize: '1.9rem'}}>{visual.emoji}</div>
									<span className="mt-2 small fw-semibold d-block text-uppercase" style={{letterSpacing: '.5px'}}>
										{meta.label}
									</span>
								</div>
							</Link>
						</div>
					);
				})}
			</div>
		</div>
	);
}
