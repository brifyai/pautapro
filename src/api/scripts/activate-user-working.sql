-- =====================================================
-- ACTIVACIÓN DEFINITIVA DE USUARIO ADMINISTRADOR
-- Usuario: camiloalegriabarra@gmail.com
-- =====================================================

-- PASO 1: VERIFICAR ESTRUCTURA COMPLETA DE LA TABLA USUARIOS
SELECT
    'ESTRUCTURA DE TABLA USUARIOS' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: VERIFICAR USUARIOS EXISTENTES
SELECT
    'USUARIOS EXISTENTES' as info,
    id_usuario,
    nombre,
    email,
    fecha_creacion
FROM usuarios
ORDER BY fecha_creacion DESC
LIMIT 10;

-- PASO 3: ACTIVAR USUARIO (SOLO CON COLUMNAS QUE EXISTEN)
-- Nota: Solo actualizamos 'estado' ya que es la única columna que parece existir
UPDATE usuarios
SET estado = true
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 4: VERIFICAR RESULTADO
SELECT
    'RESULTADO ACTIVACIÓN' as info,
    id_usuario,
    nombre,
    email,
    estado,
    fecha_creacion
FROM usuarios
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 5: SI NECESITAS CREAR UN USUARIO ADMINISTRADOR NUEVO
-- (Descomenta estas líneas si el usuario no existe)
/*
INSERT INTO usuarios (nombre, email, estado, fecha_creacion)
VALUES ('Camilo Alegria', 'camiloalegriabarra@gmail.com', true, NOW())
ON CONFLICT (email) DO UPDATE SET estado = true;
*/