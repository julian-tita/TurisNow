import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import UsersManagement from '../admin/UsersManagement';
import ExperiencesManagement from '../admin/ExperiencesManagement';

type MenuOption = 'overview' | 'users' | 'experiences';

const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuOption>('overview');

  // Verificar que el usuario sea admin
  if (!user || user.rol !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
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
          <p className="text-muted small">Bienvenido, {user.nombreCompleto}</p>
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

// Componente de Overview con KPIs
const OverviewSection: React.FC = () => {
  return (
    <div className="overview-section">
      {/* KPIs Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon money">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="kpi-content">
            <h3>Today's Money</h3>
            <div className="kpi-value">$53k</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              +55% than last week
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon users">
            <i className="fas fa-users"></i>
          </div>
          <div className="kpi-content">
            <h3>Today's Users</h3>
            <div className="kpi-value">2,300</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              +3% than last month
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon clients">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="kpi-content">
            <h3>New Clients</h3>
            <div className="kpi-value">3,462</div>
            <div className="kpi-change negative">
              <i className="fas fa-arrow-down"></i>
              -2% than yesterday
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon sales">
            <i className="fas fa-chart-bar"></i>
          </div>
          <div className="kpi-content">
            <h3>Sales</h3>
            <div className="kpi-value">$103,430</div>
            <div className="kpi-change positive">
              <i className="fas fa-arrow-up"></i>
              +5% than yesterday
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Website View</h3>
            <p className="text-muted">Last Campaign Performance</p>
          </div>
          <div className="chart-body">
            {/* Placeholder para gráfico */}
            <div className="chart-placeholder">
              <i className="fas fa-chart-bar fa-3x text-muted"></i>
              <p className="text-muted mt-3">Gráfico de vistas del sitio web</p>
              <small className="text-muted">Campaign sent 2 days ago</small>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Daily Sales</h3>
            <p className="text-muted">15% increase in today sales</p>
          </div>
          <div className="chart-body">
            <div className="chart-placeholder">
              <i className="fas fa-chart-line fa-3x text-muted"></i>
              <p className="text-muted mt-3">Gráfico de ventas diarias</p>
              <small className="text-muted">Updated 4 min ago</small>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Completed Tasks</h3>
            <p className="text-muted">Last Campaign Performance</p>
          </div>
          <div className="chart-body">
            <div className="chart-placeholder">
              <i className="fas fa-tasks fa-3x text-muted"></i>
              <p className="text-muted mt-3">Tareas completadas</p>
              <small className="text-muted">Just updated</small>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        <div className="section-card">
          <div className="section-header">
            <h3>Projects</h3>
            <p className="text-muted">
              <i className="fas fa-check-circle text-success"></i>
              30 done this month
            </p>
          </div>
          <div className="projects-table">
            <table className="table">
              <thead>
                <tr>
                  <th>COMPANIES</th>
                  <th>MEMBERS</th>
                  <th>BUDGET</th>
                  <th>COMPLETION</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="company-info">
                      <div className="company-logo">
                        <i className="fab fa-adobe"></i>
                      </div>
                      <span>Material XD Version</span>
                    </div>
                  </td>
                  <td>
                    <div className="members-avatars">
                      <span className="avatar">👤</span>
                      <span className="avatar">👤</span>
                      <span className="avatar">👤</span>
                    </div>
                  </td>
                  <td>$14,000</td>
                  <td>
                    <div className="progress-wrapper">
                      <div className="progress">
                        <div className="progress-bar" style={{ width: '60%' }}>60%</div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="company-info">
                      <div className="company-logo">
                        <i className="fab fa-atlassian"></i>
                      </div>
                      <span>Add Progress Track</span>
                    </div>
                  </td>
                  <td>
                    <div className="members-avatars">
                      <span className="avatar">👤</span>
                      <span className="avatar">👤</span>
                    </div>
                  </td>
                  <td>$3,000</td>
                  <td>
                    <div className="progress-wrapper">
                      <div className="progress">
                        <div className="progress-bar bg-success" style={{ width: '10%' }}>10%</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header">
            <h3>Orders Overview</h3>
            <p className="text-muted">
              <i className="fas fa-arrow-up text-success"></i>
              24% this month
            </p>
          </div>
          <div className="orders-timeline">
            <div className="timeline-item">
              <div className="timeline-icon success">
                <i className="fas fa-bell"></i>
              </div>
              <div className="timeline-content">
                <h4>$2400, Design changes</h4>
                <p className="text-muted">22 DEC 7:20 PM</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon error">
                <i className="fas fa-exclamation"></i>
              </div>
              <div className="timeline-content">
                <h4>New order #1832412</h4>
                <p className="text-muted">21 DEC 11 PM</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon info">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div className="timeline-content">
                <h4>Server payments for April</h4>
                <p className="text-muted">21 DEC 9:34 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
