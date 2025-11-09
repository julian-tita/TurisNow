import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UsersManagement from '../admin/UsersManagement';
import ExperiencesManagement from '../admin/ExperiencesManagement';
import adminService from '../../services/adminService';

// Interfaz local para estadísticas
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

type MenuOption = 'overview' | 'users' | 'experiences';

const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuOption>('overview');

  // Verificar que el usuario sea admin
  if (!user || user.rol !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>
            <i className="fas fa-crown" style={{ color: '#ffd700' }}></i>
            Admin Panel
          </h2>
          <p className="text-muted small">Bienvenido, {user.nombre} {user.apellido}</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeMenu === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveMenu('overview')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
          >
            <i className="fas fa-users"></i>
            <span>Usuarios</span>
          </button>

          <button
            className={`nav-item ${activeMenu === 'experiences' ? 'active' : ''}`}
            onClick={() => setActiveMenu('experiences')}
          >
            <i className="fas fa-map-marked-alt"></i>
            <span>Experiencias</span>
          </button>

          <div className="sidebar-divider"></div>

          <button className="nav-item">
            <i className="fas fa-cog"></i>
            <span>Configuración</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        <div className="content-header">
          <h1>
            {activeMenu === 'overview' && 'Dashboard General'}
            {activeMenu === 'users' && 'Gestión de Usuarios'}
            {activeMenu === 'experiences' && 'Gestión de Experiencias'}
          </h1>
          <div className="breadcrumb">
            <span>Dashboard</span>
            <i className="fas fa-chevron-right"></i>
            <span>
              {activeMenu === 'overview' && 'Home'}
              {activeMenu === 'users' && 'Usuarios'}
              {activeMenu === 'experiences' && 'Experiencias'}
            </span>
          </div>
        </div>

        <div className="content-body">
          {activeMenu === 'overview' && <OverviewSection />}
          {activeMenu === 'users' && <UsersManagement />}
          {activeMenu === 'experiences' && <ExperiencesManagement />}
        </div>
      </main>
    </div>
  );
};

// Componente de Overview con KPIs reales
const OverviewSection: React.FC = () => {
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
      {/* KPIs Cards con datos reales */}
      <div className="kpi-grid">
        {/* Ingresos del día */}
        <div className="kpi-card">
          <div className="kpi-icon money">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="kpi-content">
            <h3>Ingresos Hoy</h3>
            <div className="kpi-value">{adminService.formatearPrecio(estadisticas.ingresosHoy)}</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              {calcularPorcentaje(estadisticas.ingresosHoy, estadisticas.ingresosMesActual)}% del mes
            </div>
          </div>
        </div>

        {/* Reservas totales */}
        <div className="kpi-card">
          <div className="kpi-icon users">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="kpi-content">
            <h3>Total Reservas</h3>
            <div className="kpi-value">{estadisticas.totalReservas.toLocaleString()}</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              {estadisticas.reservasHoy} hoy
            </div>
          </div>
        </div>

        {/* Usuarios activos */}
        <div className="kpi-card">
          <div className="kpi-icon clients">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="kpi-content">
            <h3>Usuarios Activos</h3>
            <div className="kpi-value">{estadisticas.usuariosActivos.toLocaleString()}</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              {calcularPorcentaje(estadisticas.usuariosActivos, estadisticas.totalUsuarios)}% del total
            </div>
          </div>
        </div>

        {/* Experiencias activas */}
        <div className="kpi-card">
          <div className="kpi-icon sales">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <div className="kpi-content">
            <h3>Experiencias Activas</h3>
            <div className="kpi-value">{estadisticas.experienciasActivas}</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              {calcularPorcentaje(estadisticas.experienciasActivas, estadisticas.totalExperiencias)}% del total
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estado de Reservas */}
      <div className="row mt-4 g-3">
        <div className="col-md-3">
          <div className="card border-warning">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x text-warning mb-2"></i>
              <h5 className="card-title">Pendientes</h5>
              <h2 className="text-warning mb-0">{estadisticas.reservasPendientes}</h2>
              <small className="text-muted">Requieren atención</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-success">
            <div className="card-body text-center">
              <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
              <h5 className="card-title">Confirmadas</h5>
              <h2 className="text-success mb-0">{estadisticas.reservasConfirmadas}</h2>
              <small className="text-muted">Próximas salidas</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-info">
            <div className="card-body text-center">
              <i className="fas fa-flag-checkered fa-2x text-info mb-2"></i>
              <h5 className="card-title">Completadas</h5>
              <h2 className="text-info mb-0">{estadisticas.reservasCompletadas}</h2>
              <small className="text-muted">Este mes</small>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card border-danger">
            <div className="card-body text-center">
              <i className="fas fa-times-circle fa-2x text-danger mb-2"></i>
              <h5 className="card-title">Canceladas</h5>
              <h2 className="text-danger mb-0">{estadisticas.reservasCanceladas}</h2>
              <small className="text-muted">Este mes</small>
            </div>
          </div>
        </div>
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

export default DashboardAdmin;
