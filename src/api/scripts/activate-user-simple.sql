-- =====================================================
-- ACTIVACIÓN SIMPLE DE USUARIO ADMINISTRADOR
-- Usuario: camiloalegriabarra@gmail.com
-- =====================================================

-- 1. ACTIVAR USUARIO EXISTENTE
UPDATE usuarios
SET
    estado = true,
    activo = true,
    perfil = 'admin',
    id_perfil = 1
WHERE email = 'camiloalegriabarra@gmail.com';

-- 2. VERIFICAR RESULTADO
SELECT
    nombre,
    email,
    perfil,
    id_perfil,
    estado,
    activo
FROM usuarios
WHERE email = 'camiloalegriabarra@gmail.com';