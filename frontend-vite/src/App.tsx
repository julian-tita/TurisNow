import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

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
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DashboardAdmin from './components/admin/DashboardAdmin';
import ReservarExperiencia from './pages/ReservarExperiencia';
import MisReservas from './pages/MisReservas';
import PerfilUsuario from './pages/PerfilUsuario';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import PaymentPendingPage from './pages/PaymentPendingPage';

import './assets/css/style.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
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

              {/* Profile - Protected Route */}
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <PerfilUsuario />
                  </ProtectedRoute>
                }
              />

              {/* Likes and Cart */}
              <Route path="/likes" element={<LikePage />} />
              <Route path="/cart" element={<CartPage />} />
              
              {/* Payment Callbacks - Mercado Pago */}
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failure" element={<PaymentFailurePage />} />
              <Route path="/payment/pending" element={<PaymentPendingPage />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
    </AuthProvider>
  );
}

export default App;
