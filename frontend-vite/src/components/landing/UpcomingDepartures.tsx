import React from 'react';
import { Link } from 'react-router-dom';
import type { Experience, Departure } from '../../types/experiencia.types';

interface Item {
	departure: Departure;
	experience: Experience;
}

interface Props {
	items: Item[];
	loading?: boolean;
	title?: string;
}

const Skeleton = () => (
	<div className="placeholder-glow p-3 border rounded h-100">
		<div className="placeholder col-8 mb-2"></div>
		<div className="placeholder col-5 mb-2"></div>
		<div className="placeholder col-4"></div>
	</div>
);

export default function UpcomingDepartures({ items, loading, title = 'Próximas salidas con cupo'}: Props) {
	return (
		<div className="container pb-4">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h2 className="h5 m-0">{title}</h2>
			</div>
			<div className="row g-4">
				{loading && Array.from({length:6}).map((_,i)=>(<div className="col-12 col-md-6 col-lg-4" key={i}><Skeleton/></div>))}
				{!loading && items.map(item => {
					// Defensive access: use Spanish fields from DTO
					const dep = item.departure as Partial<Departure>;
					const exp = item.experience as Partial<Experience>;
					const dateStr = dep?.fechaInicio || null;
					const date = dateStr ? new Date(dateStr).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
					const capacityLeft = typeof dep?.capacidadDisponible === 'number' ? dep.capacidadDisponible : 0;
					const capacityTotal = typeof dep?.capacidadTotal === 'number' ? dep.capacidadTotal : 0;
					const few = capacityLeft <= 3;
					const keyId = dep?.id ?? `${exp?.id || 'x'}-${Math.random()}`;
					return (
						<div className="col-12 col-md-6 col-lg-4" key={String(keyId)}>
							<div className="border rounded p-3 h-100 d-flex flex-column">
								<div className="d-flex align-items-start justify-content-between mb-2">
									<div>
										<h6 className="mb-1 text-truncate" title={exp?.titulo || ''}>{exp?.titulo || 'Experiencia'}</h6>
										<small className="text-muted">{date}</small>
									</div>
									{few && <span className="badge bg-danger">Pocos lugares</span>}
								</div>
								<div className="mt-auto d-flex justify-content-between align-items-center">
									<span className="small text-muted">Cupos: {capacityLeft}/{capacityTotal}</span>
									<Link to={`/experiencias/${exp?.id ?? ''}`} className="btn btn-sm btn-primary">Ver</Link>
								</div>
							</div>
						</div>
					);
				})}
				{!loading && items.length === 0 && <p className="text-muted small">No hay salidas próximas con cupos.</p>}
			</div>
		</div>
	);
}
