import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import adminService from '../../../services/adminService';
import KpiCard from './KpiCard';

interface AdminEstadisticas {
  totalUsuarios: number;
  totalExperiencias: number;
  totalReservas: number;
  reservasPendientes: number;
  reservasConfirmadas: number;
  reservasCanceladas: number;
  reservasCompletadas: number;
  ingresosTotales: number;
  ingresosHoy: number;
  ingresosMesActual: number;
  reservasHoy: number;
  reservasMesActual: number;
  experienciasActivas: number;
  usuariosActivos: number;
}

const OverviewKPIs: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<AdminEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const data = await adminService.obtenerEstadisticas();
        setEstadisticas(data);
      } catch (error: any) {
        console.error('Error al cargar estadísticas:', error);
        toast.error('Error al cargar estadísticas del sistema');
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="alert alert-warning">
        <i className="fas fa-exclamation-triangle me-2"></i>
        No se pudieron cargar las estadísticas
      </div>
    );
  }

  const calcularPorcentaje = (actual: number, total: number) => {
    if (total === 0) return 0;
    return ((actual / total) * 100).toFixed(1);
  };

  return (
    <div className="overview-section">
      {/* KPIs Cards - Estado de reservas (datos reales del backend) */}
      <div className="kpi-grid">
        <KpiCard
          title="Pendientes"
          value={estadisticas.reservasPendientes}
          icon="fas fa-clock"
          iconType="users"
          changeText="Requieren atención"
          changeType="neutral"
        />

        <KpiCard
          title="Confirmadas"
          value={estadisticas.reservasConfirmadas}
          icon="fas fa-check-circle"
          iconType="clients"
          changeText="Próximas salidas"
          changeType="positive"
        />

        <KpiCard
          title="Completadas"
          value={estadisticas.reservasCompletadas}
          icon="fas fa-flag-checkered"
          iconType="sales"
          changeText="Este mes"
          changeType="positive"
        />

        <KpiCard
          title="Canceladas"
          value={estadisticas.reservasCanceladas}
          icon="fas fa-times-circle"
          iconType="money"
          changeText="Este mes"
          changeType="negative"
        />
      </div>

      {/* Resumen Financiero */}
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Resumen Financiero
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6 border-end">
                  <p className="text-muted mb-1">Ingresos Totales</p>
                  <h3 className="mb-0">{adminService.formatearPrecio(estadisticas.ingresosTotales)}</h3>
                </div>
                <div className="col-6">
                  <p className="text-muted mb-1">Ingresos Este Mes</p>
                  <h3 className="mb-0">{adminService.formatearPrecio(estadisticas.ingresosMesActual)}</h3>
                </div>
              </div>
              <div className="progress mt-3" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${calcularPorcentaje(estadisticas.ingresosMesActual, estadisticas.ingresosTotales)}%` }}
                  aria-valuenow={Number(calcularPorcentaje(estadisticas.ingresosMesActual, estadisticas.ingresosTotales))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {calcularPorcentaje(estadisticas.ingresosMesActual, estadisticas.ingresosTotales)}%
                </div>
              </div>
              <p className="text-muted mt-2 mb-0">
                <i className="fas fa-info-circle me-1"></i>
                {calcularPorcentaje(estadisticas.ingresosMesActual, estadisticas.ingresosTotales)}% de los ingresos totales fueron este mes
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">
                <i className="fas fa-users me-2"></i>
                Estadísticas de Usuarios
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6 border-end">
                  <p className="text-muted mb-1">Total Usuarios</p>
                  <h3 className="mb-0">{estadisticas.totalUsuarios.toLocaleString()}</h3>
                </div>
                <div className="col-6">
                  <p className="text-muted mb-1">Usuarios Activos</p>
                  <h3 className="mb-0">{estadisticas.usuariosActivos.toLocaleString()}</h3>
                </div>
              </div>
              <div className="progress mt-3" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-info" 
                  role="progressbar" 
                  style={{ width: `${calcularPorcentaje(estadisticas.usuariosActivos, estadisticas.totalUsuarios)}%` }}
                  aria-valuenow={Number(calcularPorcentaje(estadisticas.usuariosActivos, estadisticas.totalUsuarios))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  {calcularPorcentaje(estadisticas.usuariosActivos, estadisticas.totalUsuarios)}%
                </div>
              </div>
              <p className="text-muted mt-2 mb-0">
                <i className="fas fa-info-circle me-1"></i>
                {calcularPorcentaje(estadisticas.usuariosActivos, estadisticas.totalUsuarios)}% de los usuarios están activos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewKPIs;
