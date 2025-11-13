-- =====================================================
-- ACTIVACIÓN FINAL DE USUARIO ADMINISTRADOR
-- Usuario: camiloalegriabarra@gmail.com
-- =====================================================

-- PRIMERO: VERIFICAR ESTRUCTURA DE LA TABLA USUARIOS
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'usuarios'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ACTIVAR USUARIO CON LAS COLUMNAS CORRECTAS
UPDATE usuarios
SET
    estado = true,
    perfil = 'admin',
    id_perfil = 1
WHERE email = 'camiloalegriabarra@gmail.com';

-- VERIFICAR RESULTADO
SELECT
    id_usuario,
    nombre,
    email,
    perfil,
    id_perfil,
    estado,
    fecha_creacion
FROM usuarios
WHERE email = 'camiloalegriabarra@gmail.com';