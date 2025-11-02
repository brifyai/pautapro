-- 🔍 VERIFICAR ESTRUCTURA REAL DE LA TABLA usuarios
-- Este script muestra las columnas reales de la tabla

-- Verificar columnas de la tabla usuarios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar datos actuales de Camilo
SELECT
    id,
    email,
    nombre,
    password
FROM usuarios
WHERE email LIKE '%camilo%'
LIMIT 1;

-- Si la columna es 'password', usar este UPDATE:
UPDATE usuarios 
SET password = '$2b$12$mJodKxTVgvzbTl1HqpHi1.lP8juay3aJ8o7l3FBRHNV7wdV18.dBu'
WHERE email LIKE '%camilo%';

-- Verificar que la actualización funcionó
SELECT 
    email,
    LEFT(password, 20) || '...' as password_actualizado,
    '✅ Contraseña actualizada correctamente' as estado
FROM usuarios 
WHERE email LIKE '%camilo%';