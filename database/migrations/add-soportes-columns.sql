-- Script para agregar columnas faltantes a la tabla soportes
-- Ejecutar en Supabase SQL Editor

-- Agregar columna bonificacionano si no existe
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS bonificacionano DECIMAL(5,2) DEFAULT 0;

-- Agregar columna escala si no existe
ALTER TABLE soportes
ADD COLUMN IF NOT EXISTS escala DECIMAL(5,2) DEFAULT 0;

-- Verificar que las columnas se agregaron correctamente
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'soportes'
AND column_name IN ('bonificacionano', 'escala')
ORDER BY column_name;