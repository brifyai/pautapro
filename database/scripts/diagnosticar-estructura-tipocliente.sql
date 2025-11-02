-- Diagnosticar la estructura real de la tabla tipocliente
-- Verificar qué columnas existen realmente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tipocliente' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos existentes con SELECT *
SELECT * FROM tipocliente LIMIT 5;

-- Verificar cuántos registros existen
SELECT COUNT(*) as total_registros FROM tipocliente;

-- Intentar identificar el nombre correcto de la columna ID
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tipocliente' 
AND table_schema = 'public'
AND (column_name LIKE '%id%' OR column_name LIKE '%codigo%')
ORDER BY column_name;