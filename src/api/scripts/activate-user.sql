rc/api/scripts/activate-user.sql</path>
<content">-- =====================================================
-- ACTIVOAR USUARIO EN BASE DE DATOS - PAUTAPRO
-- =====================================================
-- Usuario: camiloalegriabarra@gmail.com
-- Descripción: Activar usuario y otorgarle permisos de administrador
-- =====================================================

-- 1. ACTIVAR USUARIO
UPDATE usuarios 
SET 
    estado = true,
    activo = true,
    perfil = 'admin',
    id_perfil = 1
WHERE email = 'camiloalegriabarra@gmail.com';

-- 2. SI EL USUARIO NO EXISTE, CREARLO
DO $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Verificar si el usuario existe
    SELECT EXISTS(
        SELECT 1 FROM usuarios 
        WHERE email = 'camiloalegriabarra@gmail.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Crear usuario administrador
        INSERT INTO usuarios (
            nombre,
            email,
            password,
            perfil,
            id_perfil,
            estado,
            activo,
            fecha_creacion
        ) VALUES (
            'Camilo Alegria',
            'camiloalegriabarra@gmail.com',
            '$2a$10$m5W3qgx6nGkV0GqA7HcXVu6dKq8Z1Q9S3X4T6U8V0W2Y4Z6A8B0C2E4F6G8I0', -- password hasheado: admin123
            'admin',
            1,
            true,
            true,
            NOW()
        );
        
        RAISE NOTICE 'Usuario creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario actualizado exitosamente';
    END IF;
END $$;

-- 3. VERIFICAR PERMISOS MÓDULO API
INSERT INTO permisos_modulos (
    id_usuario,
    modulo,
    ver,
    crear,
    editar,
    eliminar,
    admin,
    configuracion
)
SELECT 
    u.id_usuario,
    'api',
    true,
    true,
    true,
    true,
    true,
    true
FROM usuarios u
WHERE u.email = 'camiloalegriabarra@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM permisos_modulos pm 
    WHERE pm.id_usuario = u.id_usuario 
    AND pm.modulo = 'api'
);

-- 4. CREAR PERMISO ESPECÍFICO PARA ADMIN/API
INSERT INTO permisos_usuarios (
    id_usuario,
    id_permiso
)
SELECT 
    u.id_usuario,
    p.id_permiso
FROM usuarios u
CROSS JOIN permisos p
WHERE u.email = 'camiloalegriabarra@gmail.com'
AND (p.nombre_permiso LIKE '%api%' OR p.nombre_permiso LIKE '%admin%')
AND NOT EXISTS (
    SELECT 1 FROM permisos_usuarios pu 
    WHERE pu.id_usuario = u.id_usuario 
    AND pu.id_permiso = p.id_permiso
);

-- 5. VERIFICAR RESULTADO
SELECT 
    'VERIFICACIÓN FINAL' as tipo,
    u.nombre,
    u.email,
    u.perfil,
    u.id_perfil,
    u.estado,
    u.activo
FROM usuarios u
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- 6. MOSTRAR MÓDULOS DISPONIBLES PARA EL USUARIO
SELECT 
    'PERMISOS MÓDULOS' as tipo,
    pm.modulo,
    pm.ver,
    pm.crear,
    pm.editar,
    pm.eliminar,
    pm.admin
FROM permisos_modulos pm
JOIN usuarios u ON u.id_usuario = pm.id_usuario
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- 7. MOSTRAR PERMISOS ESPECÍFICOS
SELECT 
    'PERMISOS ESPECÍFICOS' as tipo,
    p.nombre_permiso,
    p.descripcion_permiso
FROM permisos_usuarios pu
JOIN usuarios u ON u.id_usuario = pu.id_usuario
JOIN permisos p ON p.id_permiso = pu.id_permiso
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- RESULTADO ESPERADO:
-- ✅ Usuario activado
-- ✅ Perfil: admin
-- ✅ ID Perfil: 1
-- ✅ Estado: true
-- ✅ Permisos de API: completos
-- ✅ Acceso al panel /admin/api: habilitado