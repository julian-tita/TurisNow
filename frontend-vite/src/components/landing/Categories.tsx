const CATS = ["Aventura", "Cultural", "Gastronomía", "Relax"] as const;

export default function Categories() {
  return (
    <section className="container py-5">
      <h2 className="h4 mb-3">Explorá por categoría</h2>
      <div className="row g-3 row-cols-2 row-cols-md-4">
        {CATS.map((cat) => (
          <div className="col" key={cat}>
            <a className="card h-100 text-decoration-none" href={`/experiencias?cat=${encodeURIComponent(cat)}`}>
              <div className="ratio ratio-4x3">
                <img className="card-img-top object-fit-cover" src={`https://picsum.photos/seed/${cat}/400/300`} alt={cat}/>
              </div>
              <div className="card-body">
                <span className="stretched-link fw-semibold">{cat}</span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
