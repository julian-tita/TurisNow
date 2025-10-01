export default function Hero() {
  return (
    <header className="position-relative">
      <img
        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" /* reemplazá por la tuya */
        className="w-100 object-fit-cover"
        style={{ maxHeight: 540 }}
        alt="Paisaje turístico"
      />

      <div 
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ 
          background: 'rgba(0, 0, 0, 0.4)', /* Ajusta la opacidad aquí */
          zIndex: 1 
        }}
      ></div>

      <div className="position-absolute top-50 start-50 translate-middle text-center text-white px-3"
           style={{ 
             textShadow: "0 1px 8px rgba(0,0,0,.55)",
             zIndex: 2 
           }}>
        <h1 className="display-6 fw-semibold">Descubrí tu próxima experiencia</h1>
        <p className="lead mb-3">Reservá actividades, escapadas y tours</p>
        <a className="btn btn-primary btn-lg" href="/experiencias">Ver experiencias</a>
      </div>
    </header>
  );
}
