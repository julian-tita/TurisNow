import React from 'react';
import { Link } from 'react-router-dom';

const categories: { key: string; label: string; emoji: string; color: string }[] = [
	{ key: 'playa', label: 'Playa', emoji: '🏖️', color: 'linear-gradient(135deg,#56CCF2,#2F80ED)' },
	{ key: 'montaña', label: 'Montaña', emoji: '🏔️', color: 'linear-gradient(135deg,#89F7FE,#66A6FF)' },
	{ key: 'aventura', label: 'Aventura', emoji: '🧗', color: 'linear-gradient(135deg,#F7971E,#FFD200)' },
	{ key: 'gastronomía', label: 'Gastronomía', emoji: '🍷', color: 'linear-gradient(135deg,#FF9A9E,#FECFEF)' },
	{ key: 'cultura', label: 'Cultura', emoji: '🏛️', color: 'linear-gradient(135deg,#43CBFF,#9708CC)' },
];

export default function CategoryStrip() {
	return (
		<div className="container py-4">
			<h2 className="h5 mb-3">Explorar por categoría</h2>
			<div className="row g-3 justify-content-center">
				{categories.map(cat => (
					<div className="col-8 col-sm-5 col-md-3 col-lg-2 d-flex" key={cat.key}>
						<Link to={`/experiencias?categoria=${encodeURIComponent(cat.key)}`} className="text-decoration-none w-100">
							<div className="rounded shadow-sm text-center p-3 h-100 d-flex flex-column justify-content-center"
									 style={{background: cat.color, color: '#fff', minHeight: 110}}>
								<div style={{fontSize: '1.9rem'}}>{cat.emoji}</div>
								<span className="mt-2 small fw-semibold d-block text-uppercase" style={{letterSpacing: '.5px'}}>{cat.label}</span>
							</div>
						</Link>
					</div>
				))}
			</div>
		</div>
	);
}
