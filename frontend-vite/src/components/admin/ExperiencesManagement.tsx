import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminExperienciaService from '../../services/adminExperienciaService';
import type { ExperienciaAdminResponse, PaginatedResponse } from '../../services/adminExperienciaService';
import ExperienciaForm from './ExperienciaForm';
import SalidasManagement from './SalidasManagement';

const ExperiencesManagement: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienciaAdminResponse[]>([]);
  const [pageResponse, setPageResponse] = useState<PaginatedResponse<ExperienciaAdminResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [showSalidas, setShowSalidas] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienciaAdminResponse | null>(null);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number>(0);

  const loadExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const response = searchTerm.trim()
        ? await adminExperienciaService.buscarExperiencias(searchTerm.trim(), currentPage, pageSize)
        : await adminExperienciaService.listarExperiencias({ page: currentPage, size: pageSize, sortBy: 'id', sortDir: 'DESC' });
      
      setPageResponse(response);
      setExperiences(response.content);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar experiencias');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => { loadExperiences(); }, [loadExperiences]);

  if (loading && !experiences.length) {
    return <div className="loading-container"><i className="fas fa-spinner fa-spin fa-3x"></i><p>Cargando...</p></div>;
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => { setEditingExperience(null); setShowForm(true); }} className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Nueva
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-map-marked-alt"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total</span>
            <span className="stat-value">{pageResponse?.totalElements || 0}</span>
          </div>
        </div>
      </div>

      <div className="management-table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Ubicación</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {experiences.length === 0 ? (
              <tr><td colSpan={6}>No hay experiencias</td></tr>
            ) : (
              experiences.map(exp => (
                <tr key={exp.id}>
                  <td>{exp.id}</td>
                  <td>{exp.titulo}</td>
                  <td>{exp.ubicacion.ciudad}</td>
                  <td>{exp.precio} {exp.moneda}</td>
                  <td><span className={`badge ${exp.activo ? 'bg-success' : 'bg-secondary'}`}>{exp.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={async () => {
                        try {
                          const det = await adminExperienciaService.obtenerExperiencia(exp.id);
                          setEditingExperience(det);
                          setShowForm(true);
                        } catch (err: any) { toast.error(err.message); }
                      }}><i className="fas fa-edit"></i></button>
                      <button className="btn-icon" onClick={async () => {
                        if (!window.confirm('¿Eliminar?')) return;
                        try {
                          await adminExperienciaService.eliminarExperiencia(exp.id);
                          loadExperiences();
                          toast.success('Eliminado');
                        } catch (err: any) { toast.error(err.message); }
                      }}><i className="fas fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageResponse && pageResponse.totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>←</button>
          <span>Página {currentPage + 1} de {pageResponse.totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= pageResponse.totalPages - 1}>→</button>
        </div>
      )}

      {showForm && <ExperienciaForm experiencia={editingExperience as any} onSave={() => { setShowForm(false); loadExperiences(); }} onCancel={() => setShowForm(false)} />}
      {showSalidas && selectedExperienceId && <SalidasManagement experienciaId={selectedExperienceId} onClose={() => setShowSalidas(false)} />}
    </div>
  );
};

export default ExperiencesManagement;
