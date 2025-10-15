import React, { useState, useEffect } from 'react';

interface Experience {
  id: number;
  titulo: string;
  descripcion: string;
  destino: string;
  precio: number;
  duracion: string;
  categoria: string;
  imagen?: string;
  activo: boolean;
  fechaCreacion?: string;
}

const ExperiencesManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Simular carga de experiencias (sustituir por llamada API real)
  useEffect(() => {
    const mockExperiences: Experience[] = [
      {
        id: 1,
        titulo: 'Tour por Machu Picchu',
        descripcion: 'Descubre la ciudad perdida de los Incas',
        destino: 'Cusco, Perú',
        precio: 450,
        duracion: '3 días',
        categoria: 'Aventura',
        activo: true,
        fechaCreacion: '2024-01-10'
      },
      {
        id: 2,
        titulo: 'Safari en Serengueti',
        descripcion: 'Observa la vida salvaje africana',
        destino: 'Tanzania',
        precio: 1200,
        duracion: '7 días',
        categoria: 'Naturaleza',
        activo: true,
        fechaCreacion: '2024-02-15'
      },
      {
        id: 3,
        titulo: 'Tour Gastronómico en Tokio',
        descripcion: 'Explora la cocina japonesa auténtica',
        destino: 'Tokio, Japón',
        precio: 300,
        duracion: '1 día',
        categoria: 'Gastronomía',
        activo: true,
        fechaCreacion: '2024-03-20'
      },
      {
        id: 4,
        titulo: 'Buceo en la Gran Barrera',
        descripcion: 'Sumérgete en el arrecife más grande del mundo',
        destino: 'Queensland, Australia',
        precio: 800,
        duracion: '5 días',
        categoria: 'Aventura',
        activo: false,
        fechaCreacion: '2024-04-05'
      },
      {
        id: 5,
        titulo: 'Ruta del Vino en Toscana',
        descripcion: 'Degusta los mejores vinos italianos',
        destino: 'Toscana, Italia',
        precio: 600,
        duracion: '4 días',
        categoria: 'Gastronomía',
        activo: true,
        fechaCreacion: '2024-05-12'
      }
    ];

    setTimeout(() => {
      setExperiences(mockExperiences);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ['ALL', ...Array.from(new Set(experiences.map(e => e.categoria)))];

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = 
      exp.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || exp.categoria === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleToggleStatus = (experienceId: number) => {
    setExperiences(experiences.map(exp => 
      exp.id === experienceId ? { ...exp, activo: !exp.activo } : exp
    ));
  };

  const handleDeleteExperience = (experienceId: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      setExperiences(experiences.filter(exp => exp.id !== experienceId));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
        <p>Cargando experiencias...</p>
      </div>
    );
  }

  return (
    <div className="management-container">
      {/* Header con búsqueda y filtros */}
      <div className="management-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar por título, destino o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select 
            className="form-select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>

          <button className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>
            Nueva Experiencia
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon experiences">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Experiencias</span>
            <span className="stat-value">{experiences.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Activas</span>
            <span className="stat-value">{experiences.filter(e => e.activo).length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon categories">
            <i className="fas fa-tags"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Categorías</span>
            <span className="stat-value">{categories.length - 1}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="stat-content">
            <span className="stat-label">Precio Promedio</span>
            <span className="stat-value">
              ${Math.round(experiences.reduce((acc, e) => acc + e.precio, 0) / experiences.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de experiencias */}
      <div className="management-table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Experiencia</th>
              <th>Destino</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Duración</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredExperiences.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center">
                  <div className="no-results">
                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                    <p>No se encontraron experiencias</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExperiences.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>
                    <div className="experience-cell">
                      <div className="experience-image">
                        <i className="fas fa-image"></i>
                      </div>
                      <div className="experience-info">
                        <span className="experience-title">{exp.titulo}</span>
                        <span className="experience-description">{exp.descripcion}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <i className="fas fa-map-marker-alt text-danger me-2"></i>
                    {exp.destino}
                  </td>
                  <td>
                    <span className="category-badge">{exp.categoria}</span>
                  </td>
                  <td className="price-cell">${exp.precio}</td>
                  <td>
                    <i className="far fa-clock me-2 text-muted"></i>
                    {exp.duracion}
                  </td>
                  <td>
                    <span className={`status-badge ${exp.activo ? 'active' : 'inactive'}`}>
                      {exp.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-view"
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className={`btn-icon ${exp.activo ? 'btn-pause' : 'btn-play'}`}
                        title={exp.activo ? 'Desactivar' : 'Activar'}
                        onClick={() => handleToggleStatus(exp.id)}
                      >
                        <i className={`fas fa-${exp.activo ? 'pause' : 'play'}`}></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        title="Eliminar"
                        onClick={() => handleDeleteExperience(exp.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button className="btn btn-sm btn-outline-primary">
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="btn btn-sm btn-primary">1</button>
        <button className="btn btn-sm btn-outline-primary">2</button>
        <button className="btn btn-sm btn-outline-primary">3</button>
        <button className="btn btn-sm btn-outline-primary">
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ExperiencesManagement;
