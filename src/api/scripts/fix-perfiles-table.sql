-- =====================================================
-- CORRECCIÓN DE TABLA PERFILES - SISTEMA PAUTAPRO
-- =====================================================

-- 1. Verificar perfiles actuales
SELECT 'PERFILES ACTUALES:' AS info;
SELECT id, nombreperfil, descripcion FROM perfiles ORDER BY id;

-- 2. Limpiar perfiles existentes (si hay datos incorrectos)
-- DELETE FROM perfiles WHERE nombreperfil NOT IN ('Director', 'Gerente', 'Financiero', 'Supervisor', 'Planificador', 'Asistente', 'Administrador');

-- 3. Insertar perfiles estándar usando el campo correcto 'nombreperfil'
INSERT INTO perfiles (nombreperfil, descripcion) VALUES
('Director', 'Director con acceso completo a todas las funcionalidades del sistema'),
('Gerente', 'Gerente con acceso a gestión y reportes avanzados'),
('Financiero', 'Acceso especializado a presupuestos, facturación y reportes financieros'),
('Supervisor', 'Supervisor con acceso a supervisión de campañas y equipos'),
('Planificador', 'Planificador con acceso a creación y gestión de campañas publicitarias'),
('Asistente', 'Asistente con acceso básico a funciones administrativas'),
('Administrador', 'Administrador del sistema con permisos elevados')
ON CONFLICT (nombreperfil) DO NOTHING;

-- 4. Verificar perfiles después de inserción
SELECT 'PERFILES DESPUÉS DE INSERCIÓN:' AS info;
SELECT id, nombreperfil, descripcion FROM perfiles ORDER BY id;

-- 5. Actualizar perfil del usuario administrador (Camilo Alegria)
-- Nota: La tabla usuarios no tiene campo 'perfil', usa id_perfil para referenciar a la tabla perfiles
UPDATE usuarios
SET id_perfil = (SELECT id FROM perfiles WHERE nombreperfil = 'Administrador' LIMIT 1)
WHERE email = 'camiloalegriabarra@gmail.com';

-- 6. Verificar actualización del usuario
SELECT 'USUARIO ACTUALIZADO:' AS info;
SELECT
    u.id,
    u.nombre,
    u.email,
    u.id_perfil,
    p.nombreperfil as perfil_oficial,
    p.descripcion as descripcion_perfil
FROM usuarios u
LEFT JOIN perfiles p ON u.id_perfil = p.id
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- 7. Mostrar resumen final
SELECT 'RESUMEN FINAL:' AS info;
SELECT
    COUNT(*) as total_perfiles,
    COUNT(CASE WHEN nombreperfil = 'Administrador' THEN 1 END) as administrador_existe,
    COUNT(CASE WHEN nombreperfil = 'Director' THEN 1 END) as director_existe
FROM perfiles;

SELECT 'USUARIO ADMINISTRADOR:' AS info;
SELECT nombre, email, id_perfil FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com';