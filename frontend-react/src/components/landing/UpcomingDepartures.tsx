import React from 'react';
import { Link } from 'react-router-dom';
import { Experience, Departure } from '../../types/experience';

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
				{!loading && items.length === 0 && <p className="text-muted small">No hay salidas próximas con cupos.</p>}
			</div>
		</div>
	);
}
