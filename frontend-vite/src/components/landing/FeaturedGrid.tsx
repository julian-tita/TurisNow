import React from 'react';
import { Link } from 'react-router-dom';
import { Experience } from '../../types/experience';

interface Props {
	items: Experience[];
	loading?: boolean;
	title?: string;
}

const formatPrice = (amount: number, currency: string) => {
	try { return new Intl.NumberFormat('es-AR', {style:'currency', currency}).format(amount); } catch { return `${currency} ${amount}`; }
};

const Skeleton = () => (
	<div className="placeholder-glow p-3 border rounded h-100">
		<div className="placeholder col-12 mb-3" style={{height: 120}}></div>
		<div className="placeholder col-8 mb-2"></div>
		<div className="placeholder col-6"></div>
	</div>
);

export default function FeaturedGrid({ items, loading, title = 'Destacadas'}: Props) {
	return (
		<div className="container py-2">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h2 className="h5 m-0">{title}</h2>
				<Link to="/experiencias" className="btn btn-sm btn-outline-primary">Ver todas</Link>
			</div>
			<div className="row g-4">
				{loading && Array.from({length:6}).map((_,i)=>(<div className="col-6 col-md-4 col-lg-3" key={i}><Skeleton/></div>))}
				{!loading && items.map(exp => (
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
	);
}
