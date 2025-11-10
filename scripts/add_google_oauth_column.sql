-- =====================================================
-- Migración: Agregar soporte para Google OAuth
-- Fecha: 2024
-- Descripción: Agrega columna google_id a tabla usuarios
--              para almacenar el ID único de Google
-- =====================================================

-- 1. Agregar columna google_id (nullable, unique)
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

-- 2. Crear índice único para google_id
-- Nota: Permite NULL pero no permite duplicados
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_google_id 
ON usuarios(google_id) 
WHERE google_id IS NOT NULL;

-- 3. Agregar índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id_lookup 
ON usuarios(google_id);

-- =====================================================
-- Verificación
-- =====================================================

-- Ver estructura de la tabla usuarios
\d usuarios;

-- Contar usuarios con Google vinculado
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(google_id) as usuarios_con_google,
    COUNT(*) - COUNT(google_id) as usuarios_sin_google
FROM usuarios;

-- =====================================================
-- Rollback (en caso de necesitar revertir)
-- =====================================================

-- DESCOMENTAR SOLO SI NECESITAS REVERTIR LA MIGRACIÓN
-- ALTER TABLE usuarios DROP COLUMN IF EXISTS google_id;
-- DROP INDEX IF EXISTS idx_usuarios_google_id;
-- DROP INDEX IF EXISTS idx_usuarios_google_id_lookup;
