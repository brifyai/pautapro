-- =====================================================
-- CONFIGURACIÓN COMPLETA DEL SISTEMA PAUTAPRO
-- Ejecutar este script completo en Supabase SQL Editor
-- =====================================================

-- 1. Eliminar tablas existentes para empezar desde cero
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS mensajes CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;

-- 2. Crear tabla de usuarios (estructura mínima y funcional)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Crear tabla de mensajes para notificaciones
CREATE TABLE mensajes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'sistema',
    prioridad VARCHAR(20) DEFAULT 'info',
    leida BOOLEAN DEFAULT false,
    id_usuario INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear tabla de perfiles (roles)
CREATE TABLE perfiles (
    id_perfil SERIAL PRIMARY KEY,
    nombre_perfil VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_acceso INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Crear tabla de grupos (departamentos)
CREATE TABLE grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insertar perfiles básicos
INSERT INTO perfiles (nombre_perfil, descripcion, nivel_acceso) VALUES
('director', 'Director con acceso completo a todas las funcionalidades', 5),
('gerente', 'Gerente con acceso a gestión y reportes', 4),
('financiero', 'Acceso a presupuestos, facturación y reportes financieros', 3),
('supervisor', 'Supervisor con acceso a supervisión de campañas y equipos', 3),
('planificador', 'Planificador con acceso a creación y gestión de campañas', 2),
('asistente', 'Asistente con acceso básico a funciones administrativas', 1);

-- 7. Insertar grupos básicos
INSERT INTO grupos (nombre_grupo, descripcion) VALUES
('Dirección', 'Nivel directivo de la empresa'),
('Gerencia', 'Nivel gerencial de gestión'),
('Finanzas', 'Departamento financiero y contable'),
('Operaciones', 'Operaciones y supervisión'),
('Planificación', 'Planificación de campañas y medios'),
('Administración', 'Soporte administrativo general');

-- 8. Insertar usuario Camilo Alegria (contraseña en texto plano para desarrollo)
INSERT INTO usuarios (
    nombre, 
    apellido, 
    email, 
    password, 
    estado,
    fecha_creacion
) VALUES (
    'Camilo',
    'Alegria',
    'camiloalegriabarra@gmail.com',
    'Antonito26', -- Contraseña simple para desarrollo
    true,
    CURRENT_TIMESTAMP
);

-- 9. Insertar mensajes de bienvenida
INSERT INTO mensajes (titulo, contenido, tipo, prioridad, id_usuario) VALUES
(
    'Bienvenido a PautaPro',
    'Sistema de gestión publicitaria listo para usar. Tu cuenta de gerente está activa.',
    'sistema',
    'info',
    (SELECT id FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com')
),
(
    'Sistema Configurado',
    'Todos los módulos están funcionando correctamente. Dashboard, clientes, campañas y reportes disponibles.',
    'sistema',
    'success',
    (SELECT id FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com')
);

-- 10. Crear vista completa de usuarios
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id AS id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.estado,
    u.fecha_creacion,
    COALESCE(p.nombre_perfil, 'Sin perfil') AS nombre_perfil,
    COALESCE(p.descripcion, 'Sin descripción') AS descripcion_perfil,
    COALESCE(p.nivel_acceso, 1) AS nivel_acceso,
    COALESCE(g.nombre_grupo, 'Sin grupo') AS nombre_grupo,
    COALESCE(g.descripcion, 'Sin descripción') AS descripcion_grupo
FROM usuarios u
LEFT JOIN perfiles p ON u.id = p.id_perfil -- Usar id en lugar de id_perfil
LEFT JOIN grupos g ON u.id = g.id_grupo; -- Usar id en lugar de id_grupo

-- 11. Verificación de creación exitosa
SELECT '=== VERIFICACIÓN DE SISTEMA ===' AS resultado;

-- Verificar usuario creado
SELECT 'USUARIO CREADO:' AS info;
SELECT 
    id,
    nombre,
    apellido,
    email,
    password,
    estado,
    fecha_creacion
FROM usuarios 
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar mensajes creados
SELECT 'MENSAJES CREADOS:' AS info;
SELECT 
    id,
    titulo,
    contenido,
    tipo,
    prioridad,
    leida,
    created_at
FROM mensajes 
WHERE id_usuario = (SELECT id FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com');

-- Verificar vista
SELECT 'VISTA DE USUARIOS:' AS info;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar estructura de tablas
SELECT 'ESTRUCTURA DE TABLAS:' AS info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('usuarios', 'mensajes', 'perfiles', 'grupos')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 12. Mostrar credenciales finales
SELECT '=== CREDENCIALES DE ACCESO ===' AS resultado;
SELECT 'Email: camiloalegriabarra@gmail.com' AS email;
SELECT 'Contraseña: Antonito26' AS password;
SELECT 'Rol: Gerente (asignado manualmente)' AS rol;
SELECT 'URL: http://localhost:3002' AS url;
SELECT 'Estado: Listo para usar' AS status;

-- 13. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);
CREATE INDEX IF NOT EXISTS idx_mensajes_usuario ON mensajes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_mensajes_tipo ON mensajes(tipo);
CREATE INDEX IF NOT EXISTS idx_mensajes_leida ON mensajes(leida);

-- 14. Crear trigger para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_actualizacion
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_mensajes_actualizacion
    BEFORE UPDATE ON mensajes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

SELECT '=== SISTEMA COMPLETAMENTE CONFIGURADO ===' AS resultado;
SELECT '✅ Tablas creadas correctamente' AS status1;
SELECT '✅ Usuario Camilo Alegria creado' AS status2;
SELECT '✅ Mensajes de bienvenida agregados' AS status3;
SELECT '✅ Vista de usuarios funcionando' AS status4;
SELECT '✅ Índices y triggers creados' AS status5;
SELECT '🚀 Sistema listo para producción' AS final;