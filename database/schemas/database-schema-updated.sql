-- Script para agregar campos faltantes a las tablas clientes y proveedores
-- Ejecutar en Supabase SQL Editor

-- === CAMPOS PARA LA TABLA CLIENTES ===
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombrefantasia TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS giro TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccionEmpresa TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombreRepresentanteLegal TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS apellidoRepresentante TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS rut_representante TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telcelular TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telfijo TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS web_cliente TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_tablaformato INTEGER;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS id_moneda INTEGER;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS valor TEXT;

-- === CAMPOS PARA LA TABLA PROVEEDORES ===
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nombrefantasia TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS giro TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nombreRepresentante TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS rutRepresentante TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS telCelular TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS telFijo TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nombreidentificador TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS bonificacionano TEXT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS escala_rango TEXT;

-- Verificar que los campos se agregaron correctamente
SELECT 'CLIENTES' as tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
ORDER BY ordinal_position;

SELECT 'PROVEEDORES' as tabla, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'proveedores'
ORDER BY ordinal_position;
