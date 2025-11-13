-- =====================================================
-- ACTIVACIÓN FINAL Y DEFINITIVA DE USUARIO ADMINISTRADOR
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

-- PASO 2: VERIFICAR USUARIOS EXISTENTES (SOLO COLUMNAS QUE EXISTEN)
SELECT
    'USUARIOS EXISTENTES' as info,
    id_usuario,
    nombre,
    email
FROM usuarios
ORDER BY id_usuario DESC
LIMIT 10;

-- PASO 3: ACTIVAR USUARIO (SOLO CON COLUMNAS QUE EXISTEN)
UPDATE usuarios
SET estado = true
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 4: VERIFICAR RESULTADO (SOLO COLUMNAS QUE EXISTEN)
SELECT
    'RESULTADO ACTIVACIÓN' as info,
    id_usuario,
    nombre,
    email,
    estado
FROM usuarios
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 5: SI EL USUARIO NO EXISTE, PUEDES CREARLO MANUALMENTE
-- (Ejecuta esto solo si el usuario no aparece en los resultados anteriores)
/*
INSERT INTO usuarios (nombre, email, estado)
VALUES ('Camilo Alegria', 'camiloalegriabarra@gmail.com', true);
*/