import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';              // <- Home (index)
import About from './pages/About';            // <- About page
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

import './assets/css/style.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />

        <div className="App">
          <Routes>
            {/* 👉 Esta ruta permite /home */}
            <Route path="/home" element={<Home />} />

            {/* (opcional) que "/" redirija a /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* About page */}
            <Route path="/about" element={<About />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protegida */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
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
