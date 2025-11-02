-- Script para agregar campos faltantes a la tabla proveedores
-- Ejecutar en Supabase SQL Editor

-- Agregar campos faltantes a la tabla proveedores
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS direccion_facturacion VARCHAR(200),
ADD COLUMN IF NOT EXISTS telefono_celular VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefono_fijo VARCHAR(20),
ADD COLUMN IF NOT EXISTS identificador VARCHAR(50),
ADD COLUMN IF NOT EXISTS bonificacion_anio DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS escala_rango DECIMAL(5,2) DEFAULT 0;

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'proveedores' 
AND table_schema = 'public'
ORDER BY ordinal_position;