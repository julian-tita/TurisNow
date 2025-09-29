type Card = { title: string; location: string; price: number; img: string };
const MOCK: Card[] = [
  { title:"City Tour Premium", location:"Córdoba", price:42000, img:"https://picsum.photos/seed/card1/600/400" },
  { title:"Vino & Montaña", location:"Mendoza", price:98000, img:"https://picsum.photos/seed/card2/600/400" },
  { title:"Lagos y Cumbres", location:"Bariloche", price:120000, img:"https://picsum.photos/seed/card3/600/400" },
];

export default function Featured() {
  return (
    <section className="container pb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 m-0">Destacadas</h2>
        <a className="btn btn-sm btn-outline-secondary" href="/experiencias">Ver todas</a>
      </div>
      <div className="row g-3 row-cols-1 row-cols-md-3">
        {MOCK.map((c) => (
          <div className="col" key={c.title}>
            <div className="card h-100">
              <div className="ratio ratio-16x9">
                <img className="card-img-top object-fit-cover" src={c.img} alt={c.title}/>
              </div>
              <div className="card-body">
                <h3 className="h6 mb-1">{c.title}</h3>
                <div className="text-secondary small mb-2">{c.location}</div>
                <div className="fw-semibold">ARS {c.price.toLocaleString("es-AR")}</div>
              </div>
              <div className="card-footer bg-transparent border-0 pt-0">
                <button className="btn btn-primary w-100" data-bs-toggle="offcanvas" data-bs-target="#offcanvasCart">
                  <i className="bi bi-cart3 me-1" /> Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
