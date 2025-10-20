-- TurisNow Database Schema for Supabase PostgreSQL
-- Generated for migration from local PostgreSQL to Supabase

-- Enable UUID extension (useful for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'USER',
    fecha_creacion TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    CONSTRAINT chk_rol CHECK (rol IN ('USER', 'ADMIN'))
);

-- Experiences table  
CREATE TABLE IF NOT EXISTS experiencias (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    moneda VARCHAR(10) NOT NULL,
    ciudad VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    pais VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    imagen_url TEXT,
    
    CONSTRAINT chk_moneda CHECK (moneda IN ('ARS', 'USD', 'CLP', 'EUR')),
    CONSTRAINT chk_categoria CHECK (categoria IN ('PLAYA', 'MONTANA', 'AVENTURA', 'GASTRONOMIA', 'CULTURA'))
);

-- Departures table
CREATE TABLE IF NOT EXISTS salidas (
    id BIGSERIAL PRIMARY KEY,
    experiencia_id BIGINT NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    capacidad_total INTEGER NOT NULL,
    capacidad_disponible INTEGER NOT NULL,
    
    CONSTRAINT fk_salidas_experiencia 
        FOREIGN KEY (experiencia_id) 
        REFERENCES experiencias(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT chk_capacidad_positiva 
        CHECK (capacidad_total > 0 AND capacidad_disponible >= 0),
        
    CONSTRAINT chk_capacidad_disponible 
        CHECK (capacidad_disponible <= capacidad_total)
);

-- Experience tags junction table
CREATE TABLE IF NOT EXISTS experiencia_tags (
    experiencia_id BIGINT NOT NULL,
    tag VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_tags_experiencia 
        FOREIGN KEY (experiencia_id) 
        REFERENCES experiencias(id) 
        ON DELETE CASCADE,
        
    PRIMARY KEY (experiencia_id, tag)
);

-- Create indexes for better performance
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Experiences indexes
CREATE INDEX IF NOT EXISTS idx_experiencias_categoria ON experiencias(categoria);
CREATE INDEX IF NOT EXISTS idx_experiencias_moneda ON experiencias(moneda);
CREATE INDEX IF NOT EXISTS idx_experiencias_pais ON experiencias(pais);
CREATE INDEX IF NOT EXISTS idx_experiencias_ciudad ON experiencias(ciudad);
CREATE INDEX IF NOT EXISTS idx_experiencias_precio ON experiencias(precio);

-- Departures indexes
CREATE INDEX IF NOT EXISTS idx_salidas_experiencia ON salidas(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_salidas_fecha_inicio ON salidas(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_salidas_capacidad ON salidas(capacidad_disponible);

-- Tags indexes
CREATE INDEX IF NOT EXISTS idx_experiencia_tags_experiencia ON experiencia_tags(experiencia_id);
CREATE INDEX IF NOT EXISTS idx_experiencia_tags_tag ON experiencia_tags(tag);

-- Sample data insert (optional - remove if you have existing data)
-- =====================================================

-- Insert sample admin user (password should be properly hashed in your app)
-- INSERT INTO usuarios (username, password, email, nombre_completo, rol, fecha_creacion, activo) 
-- VALUES ('admin', '$2a$10$example_hashed_password', 'admin@turisnow.com', 'Administrator', 'ADMIN', NOW(), true);

-- Security: Enable Row Level Security (RLS) if needed for Supabase
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE experiencias ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE salidas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE experiencia_tags ENABLE ROW LEVEL SECURITY;

-- Comments for documentation
-- =====================================================
COMMENT ON TABLE usuarios IS 'User accounts with authentication and authorization';
COMMENT ON TABLE experiencias IS 'Tourism experiences/packages offered';
COMMENT ON TABLE salidas IS 'Scheduled departures for experiences';
COMMENT ON TABLE experiencia_tags IS 'Tags associated with experiences for filtering';

COMMENT ON COLUMN usuarios.rol IS 'User role: USER or ADMIN';
COMMENT ON COLUMN experiencias.moneda IS 'Currency: ARS, USD, CLP, EUR';
COMMENT ON COLUMN experiencias.categoria IS 'Experience category: PLAYA, MONTANA, AVENTURA, GASTRONOMIA, CULTURA';