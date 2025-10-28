import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LikeProvider } from './contexts/LikeContext';
import { CartProvider } from './contexts/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';              // <- Home (index)
import About from './pages/About';            // <- About page
import Explorar from './pages/Explorar';
import ExperienciasListado from './pages/ExperienciasListado';
import ExperienciaDetalle from './pages/ExperienciaDetalle';
import LikePage from './pages/LikePage';
import CartPage from './pages/CartPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardAdmin from './components/admin/DashboardAdmin';
import ReservarExperiencia from './pages/ReservarExperiencia';
import MisReservas from './pages/MisReservas';

import './assets/css/style.css';

function App() {
  return (
    <AuthProvider>
      <LikeProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Header />

            <div className="App">
              <Routes>
            {/* 👉 Esta ruta permite /home */}
            <Route path="/home" element={<Home />} />

            {/* (opcional) que "/" redirija a /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* About page */}
            <Route path="/about" element={<About />} />

              {/* Experiences */}
              <Route path="/explorar" element={<Explorar />} />
              <Route path="/experiencias" element={<ExperienciasListado />} />
              <Route path="/experiencias/:id" element={<ExperienciaDetalle />} />

              {/* Reservations - Protected Routes */}
              <Route
                path="/reservar/:experienciaId/:salidaId"
                element={
                  <ProtectedRoute>
                    <ReservarExperiencia />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mis-reservas"
                element={
                  <ProtectedRoute>
                    <MisReservas />
                  </ProtectedRoute>
                }
              />

              {/* Likes and Cart */}
              <Route path="/likes" element={<LikePage />} />
              <Route path="/cart" element={<CartPage />} />            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protegida - Usuario normal */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Protegida - Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <DashboardAdmin />
                </AdminRoute>
              }
            />

            {/* Fallback a /home para rutas desconocidas */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
            </div>

            <Footer />
          </Router>
        </CartProvider>
      </LikeProvider>
    </AuthProvider>
  );
}

export default App;
