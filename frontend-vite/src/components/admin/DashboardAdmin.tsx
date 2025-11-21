import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import UsersManagement from '../admin/UsersManagement';
import ExperiencesManagement from '../admin/ExperiencesManagement';
import ReservasManagement from '../admin/ReservasManagement';
import kpiService from '../../services/kpiService';
import type { Period, KpiBackendResponse } from '../../services/kpiService';
import PeriodSelector from '../common/PeriodSelector';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

type MenuOption = 'overview' | 'users' | 'experiences' | 'salidas' | 'reservas';

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

          <button
            className={`nav-item ${activeMenu === 'salidas' ? 'active' : ''}`}
            onClick={() => setActiveMenu('salidas')}
          >
            <i className="fas fa-calendar-alt"></i>
            <span>Salidas</span>
          </button>

          <button
            className={`nav-item ${activeMenu === 'reservas' ? 'active' : ''}`}
            onClick={() => setActiveMenu('reservas')}
          >
            <i className="fas fa-calendar-check"></i>
            <span>Reservas</span>
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
            {activeMenu === 'salidas' && 'Gestión de Salidas'}
            {activeMenu === 'reservas' && 'Gestión de Reservas'}
          </h1>
          <div className="breadcrumb">
            <span>Dashboard</span>
            <i className="fas fa-chevron-right"></i>
            <span>
              {activeMenu === 'overview' && 'Home'}
              {activeMenu === 'users' && 'Usuarios'}
              {activeMenu === 'experiences' && 'Experiencias'}
              {activeMenu === 'salidas' && 'Salidas'}
              {activeMenu === 'reservas' && 'Reservas'}
            </span>
          </div>
        </div>

        <div className="content-body">
          {activeMenu === 'overview' && <OverviewSection />}
          {activeMenu === 'users' && <UsersManagement />}
          {activeMenu === 'experiences' && <ExperiencesManagement />}
          {activeMenu === 'salidas' && (
            <div className="alert alert-info m-4">
              <i className="fas fa-info-circle me-2"></i>
              Las salidas se gestionan desde cada experiencia individual.
              Ve a "Experiencias" y edita una experiencia para gestionar sus salidas.
            </div>
          )}
          {activeMenu === 'reservas' && <ReservasManagement />}
        </div>
      </main>
    </div>
  );
};

// Componente de Overview con KPIs nuevos y gráfico
const OverviewSection: React.FC = () => {
  const [kpis, setKpis] = useState<KpiBackendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  useEffect(() => {
    cargarKpis();
  }, [selectedPeriod]);

  const cargarKpis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await kpiService.fetchKpis(selectedPeriod);
      setKpis(data);
    } catch (err: any) {
      console.error('Error al cargar KPIs:', err);
      setError('No se pudieron cargar los KPIs');
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  const handleRetry = () => {
    cargarKpis();
  };

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <div>
          <i className="fas fa-exclamation-triangle me-2"></i>
          No se pudieron cargar los KPIs
        </div>
        <button className="btn btn-sm btn-outline-danger" onClick={handleRetry}>
          <i className="fas fa-sync-alt me-1"></i>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="overview-section">
      {/* Selector de Período */}
      <div className="mb-4">
        <PeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* KPIs Grid */}
      <div className="kpi-grid">
        {loading ? (
          // Skeleton loaders
          <>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="kpi-card loading">
                <div className="kpi-icon skeleton"></div>
                <div className="kpi-content">
                  <div className="skeleton-text mb-2"></div>
                  <div className="skeleton-text large mb-2"></div>
                  <div className="skeleton-text small"></div>
                </div>
              </div>
            ))}
          </>
        ) : kpis ? (
          <>
            {/* KPI 1: Ingresos Totales */}
            <div className="kpi-card" role="button" tabIndex={0}>
              <div className="kpi-icon money">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.metricas.ingresosTotales.nombre}</h3>
                <div className="kpi-value">
                  {kpiService.formatearPrecio(kpis.metricas.ingresosTotales.valor)}
                </div>
                <div className={`kpi-change ${kpis.metricas.ingresosTotales.tendencia === 'up' ? 'positive' : kpis.metricas.ingresosTotales.tendencia === 'down' ? 'negative' : 'neutral'}`}>
                  {kpis.metricas.ingresosTotales.tendencia === 'up' && <i className="fas fa-arrow-up"></i>}
                  {kpis.metricas.ingresosTotales.tendencia === 'down' && <i className="fas fa-arrow-down"></i>}
                  {kpiService.mapVariacion(kpis.metricas.ingresosTotales.variacion / 100).text}
                </div>
              </div>
            </div>

            {/* KPI 2: Reservas Activas */}
            <div className="kpi-card" role="button" tabIndex={0}>
              <div className="kpi-icon users">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.metricas.reservasActivas.nombre}</h3>
                <div className="kpi-value">
                  {Math.round(kpis.metricas.reservasActivas.valor).toLocaleString()}
                </div>
                <div className={`kpi-change ${kpis.metricas.reservasActivas.tendencia === 'up' ? 'positive' : kpis.metricas.reservasActivas.tendencia === 'down' ? 'negative' : 'neutral'}`}>
                  {kpis.metricas.reservasActivas.tendencia === 'up' && <i className="fas fa-arrow-up"></i>}
                  {kpis.metricas.reservasActivas.tendencia === 'down' && <i className="fas fa-arrow-down"></i>}
                  {kpiService.mapVariacion(kpis.metricas.reservasActivas.variacion / 100).text}
                </div>
              </div>
            </div>

            {/* KPI 3: Nuevos Usuarios */}
            <div className="kpi-card" role="button" tabIndex={0}>
              <div className="kpi-icon clients">
                <i className="fas fa-user-plus"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.metricas.nuevosUsuarios.nombre}</h3>
                <div className="kpi-value">
                  {Math.round(kpis.metricas.nuevosUsuarios.valor).toLocaleString()}
                </div>
                <div className={`kpi-change ${kpis.metricas.nuevosUsuarios.tendencia === 'up' ? 'positive' : kpis.metricas.nuevosUsuarios.tendencia === 'down' ? 'negative' : 'neutral'}`}>
                  {kpis.metricas.nuevosUsuarios.tendencia === 'up' && <i className="fas fa-arrow-up"></i>}
                  {kpis.metricas.nuevosUsuarios.tendencia === 'down' && <i className="fas fa-arrow-down"></i>}
                  {kpiService.mapVariacion(kpis.metricas.nuevosUsuarios.variacion / 100).text}
                </div>
              </div>
            </div>

            {/* KPI 4: Tasa de Conversión */}
            <div className="kpi-card" role="button" tabIndex={0}>
              <div className="kpi-icon conversion">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="kpi-content">
                <h3>{kpis.metricas.tasaConversion.nombre}</h3>
                <div className="kpi-value">
                  {kpis.metricas.tasaConversion.valor.toFixed(1)}%
                </div>
                <div className={`kpi-change ${kpis.metricas.tasaConversion.tendencia === 'up' ? 'positive' : kpis.metricas.tasaConversion.tendencia === 'down' ? 'negative' : 'neutral'}`}>
                  {kpis.metricas.tasaConversion.tendencia === 'up' && <i className="fas fa-arrow-up"></i>}
                  {kpis.metricas.tasaConversion.tendencia === 'down' && <i className="fas fa-arrow-down"></i>}
                  {kpiService.mapVariacion(kpis.metricas.tasaConversion.variacion / 100).text}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Gráfico de Métricas */}
      {!loading && kpis && (
        <div className="chart-container mt-5">
          <div className="chart-header">
            <h4>
              <i className="fas fa-chart-line me-2"></i>
              Tendencias del período
            </h4>
          </div>
          <div className="chart-body">
            {kpis.metricas.ingresosTotales.datos && kpis.metricas.ingresosTotales.datos.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={kpis.metricas.ingresosTotales.datos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="fecha" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => kpiService.formatearPrecio(value)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    name="Ingresos"
                    stroke="#667eea" 
                    strokeWidth={2}
                    dot={{ fill: '#667eea', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-chart-line fa-3x mb-3 opacity-50"></i>
                <p>No hay datos para el período seleccionado</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAdmin;
