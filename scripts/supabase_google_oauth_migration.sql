-- =====================================================
-- Migración SIMPLIFICADA: Google OAuth
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna google_id a tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN google_id VARCHAR(255);

-- 2. Agregar constraint UNIQUE (permite NULL pero no duplicados)
ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_google_id_unique UNIQUE (google_id);

-- 3. Verificación
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND column_name = 'google_id';

-- Deberías ver:
-- column_name | data_type       | is_nullable | column_default
-- google_id   | character varying | YES         | NULL
