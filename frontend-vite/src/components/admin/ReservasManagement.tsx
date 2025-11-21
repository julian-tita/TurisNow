import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminReservaService from '../../services/adminReservaService';
import type { ReservaAdminResponse, ReservaFilters } from '../../services/adminReservaService';
import type { PaginatedResponse } from '../../services/adminExperienciaService';

const ReservasManagement: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaAdminResponse[]>([]);
  const [pageResponse, setPageResponse] = useState<PaginatedResponse<ReservaAdminResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterEstado, setFilterEstado] = useState<'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA' | ''>('');
  const [selectedReserva, setSelectedReserva] = useState<ReservaAdminResponse | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const filters: ReservaFilters = {
        page: currentPage,
        size: 10,
        sortBy: 'id',
        sortDir: 'DESC'
      };
      
      if (filterEstado) {
        filters.estado = filterEstado;
      }

      const response = await adminReservaService.listarReservas(filters);
      setPageResponse(response);
      setReservas(response.content);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservas();
  }, [currentPage, filterEstado]);

  const handleVerDetalle = async (reservaId: number) => {
    try {
      const detalle = await adminReservaService.obtenerReserva(reservaId);
      setSelectedReserva(detalle);
      setShowModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar detalle');
    }
  };

  const handleCancelar = async (reservaId: number) => {
    const motivo = window.prompt('Motivo de cancelación:');
    if (!motivo) return;

    const toastId = toast.loading('Cancelando reserva...');
    try {
      await adminReservaService.cancelarReserva(reservaId, motivo);
      await loadReservas();
      toast.success('Reserva cancelada', { id: toastId });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al cancelar', { id: toastId });
    }
  };

  const handleCompletar = async (reservaId: number) => {
    if (!window.confirm('¿Marcar como completada?')) return;

    const toastId = toast.loading('Completando reserva...');
    try {
      await adminReservaService.completarReserva(reservaId);
      await loadReservas();
      toast.success('Reserva completada', { id: toastId });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al completar', { id: toastId });
    }
  };

  const handleCheckin = async (reservaId: number) => {
    const responsable = window.prompt('Tu nombre (responsable del check-in):');
    if (!responsable) return;

    const toastId = toast.loading('Realizando check-in...');
    try {
      await adminReservaService.realizarCheckin(reservaId, responsable);
      await loadReservas();
      toast.success('Check-in realizado', { id: toastId });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error en check-in', { id: toastId });
    }
  };

  if (loading && !reservas.length) {
    return (
      <div className="loading-container">
        <i className="fas fa-spinner fa-spin fa-3x text-primary"></i>
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="management-container">
      <div className="management-header">
        <h3>Gestión de Reservas</h3>
        <div className="filter-group">
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as any)} className="form-select">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="CONFIRMADA">Confirmada</option>
            <option value="CANCELADA">Cancelada</option>
            <option value="COMPLETADA">Completada</option>
          </select>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-ticket-alt"></i></div>
          <div className="stat-content">
            <span className="stat-label">Total</span>
            <span className="stat-value">{pageResponse?.totalElements || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><i className="fas fa-check text-success"></i></div>
          <div className="stat-content">
            <span className="stat-label">Confirmadas</span>
            <span className="stat-value">{reservas.filter(r => r.estado === 'CONFIRMADA').length}</span>
          </div>
        </div>
      </div>

      <div className="management-table-container">
        <table className="management-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Usuario</th>
              <th>Experiencia</th>
              <th>Fecha Salida</th>
              <th>Personas</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Check-in</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center">No hay reservas</td>
              </tr>
            ) : (
              reservas.map(res => (
                <tr key={res.id}>
                  <td><code>{res.codigoReserva}</code></td>
                  <td>
                    <div>
                      <strong>{res.usuarioNombre}</strong>
                      <br/>
                      <small className="text-muted">{res.usuarioEmail}</small>
                    </div>
                  </td>
                  <td>{res.experienciaTitulo}</td>
                  <td>{new Date(res.salidaFecha).toLocaleDateString()}</td>
                  <td>{res.cantidadPersonas}</td>
                  <td><strong>${res.precioTotal}</strong></td>
                  <td>
                    <span className={adminReservaService.getBadgeClass(res.estado)}>
                      {res.estado}
                    </span>
                  </td>
                  <td>
                    {res.checkinRealizado ? (
                      <span className="badge bg-success">✓ Realizado</span>
                    ) : (
                      <span className="badge bg-secondary">Pendiente</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-info" onClick={() => handleVerDetalle(res.id)} title="Ver detalle">
                        <i className="fas fa-eye"></i>
                      </button>
                      {adminReservaService.puedeCheckin(res) && (
                        <button className="btn-icon btn-success" onClick={() => handleCheckin(res.id)} title="Check-in">
                          <i className="fas fa-check"></i>
                        </button>
                      )}
                      {adminReservaService.puedeCompletar(res) && (
                        <button className="btn-icon btn-primary" onClick={() => handleCompletar(res.id)} title="Completar">
                          <i className="fas fa-check-double"></i>
                        </button>
                      )}
                      {adminReservaService.puedeCancelar(res) && (
                        <button className="btn-icon btn-danger" onClick={() => handleCancelar(res.id)} title="Cancelar">
                          <i className="fas fa-times"></i>
                        </button>
                      )}
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
          <button className="pagination-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 0}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="pagination-info">Página {currentPage + 1} de {pageResponse.totalPages}</div>
          <button className="pagination-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pageResponse.totalPages - 1}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      {showModal && selectedReserva && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Detalle de Reserva</h4>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>Código:</strong> {selectedReserva.codigoReserva}</div>
                <div><strong>Estado:</strong> <span className={adminReservaService.getBadgeClass(selectedReserva.estado)}>{selectedReserva.estado}</span></div>
                <div><strong>Usuario:</strong> {selectedReserva.usuarioNombre} ({selectedReserva.usuarioEmail})</div>
                <div><strong>Experiencia:</strong> {selectedReserva.experienciaTitulo}</div>
                <div><strong>Fecha Salida:</strong> {new Date(selectedReserva.salidaFecha).toLocaleString()}</div>
                <div><strong>Personas:</strong> {selectedReserva.cantidadPersonas}</div>
                <div><strong>Precio Total:</strong> ${selectedReserva.precioTotal}</div>
                <div><strong>Fecha Reserva:</strong> {new Date(selectedReserva.fechaReserva).toLocaleString()}</div>
                
                {selectedReserva.checkinRealizado && (
                  <>
                    <div><strong>Check-in:</strong> {selectedReserva.fechaCheckin ? new Date(selectedReserva.fechaCheckin).toLocaleString() : 'N/A'}</div>
                    <div><strong>Check-in por:</strong> {selectedReserva.checkinPor || 'N/A'}</div>
                  </>
                )}
                
                {selectedReserva.motivoCancelacion && (
                  <div><strong>Motivo Cancelación:</strong> {selectedReserva.motivoCancelacion}</div>
                )}
                
                {selectedReserva.pago && (
                  <div className="pago-info">
                    <h5>Información de Pago</h5>
                    <div><strong>Estado:</strong> <span className={adminReservaService.getPagoBadgeClass(selectedReserva.pago.estado)}>{selectedReserva.pago.estado}</span></div>
                    <div><strong>Monto:</strong> ${selectedReserva.pago.montoTotal}</div>
                    {selectedReserva.pago.metodoPago && <div><strong>Método:</strong> {selectedReserva.pago.metodoPago}</div>}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasManagement;
