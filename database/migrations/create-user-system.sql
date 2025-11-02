-- =====================================================
-- SISTEMA DE USUARIOS PAUTAPRO - VERSIÓN CORREGIDA
-- =====================================================

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;

-- Crear tabla de perfiles (roles)
CREATE TABLE perfiles (
    id_perfil SERIAL PRIMARY KEY,
    nombre_perfil VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_acceso INTEGER DEFAULT 1, -- 1=menor, 5=mayor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de grupos (departamentos)
CREATE TABLE grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios con estructura mejorada
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Encriptada
    telefono VARCHAR(20),
    avatar VARCHAR(255),
    estado BOOLEAN DEFAULT true,
    id_perfil INTEGER REFERENCES perfiles(id_perfil),
    id_grupo INTEGER REFERENCES grupos(id_grupo),
    ultimo_acceso TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER,
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Insertar perfiles (roles) específicos
INSERT INTO perfiles (nombre_perfil, descripcion, nivel_acceso) VALUES
('director', 'Director con acceso completo a todas las funcionalidades', 5),
('gerente', 'Gerente con acceso a gestión y reportes', 4),
('financiero', 'Acceso a presupuestos, facturación y reportes financieros', 3),
('supervisor', 'Supervisor con acceso a supervisión de campañas y equipos', 3),
('planificador', 'Planificador con acceso a creación y gestión de campañas', 2),
('asistente', 'Asistente con acceso básico a funciones administrativas', 1);

-- Insertar grupos (departamentos)
INSERT INTO grupos (nombre_grupo, descripcion) VALUES
('Dirección', 'Nivel directivo de la empresa'),
('Gerencia', 'Nivel gerencial de gestión'),
('Finanzas', 'Departamento financiero y contable'),
('Operaciones', 'Operaciones y supervisión'),
('Planificación', 'Planificación de campañas y medios'),
('Administración', 'Soporte administrativo general');

-- Insertar usuario Camilo Alegria como gerente
INSERT INTO usuarios (
    nombre, 
    apellido, 
    email, 
    password, 
    telefono,
    estado,
    id_perfil,
    id_grupo,
    fecha_creacion
) VALUES (
    'Camilo',
    'Alegria',
    'camiloalegriabarra@gmail.com',
    'Antonito26', -- Esta contraseña será encriptada en el backend
    '+56 9 1234 5678',
    true,
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'gerente'),
    (SELECT id_grupo FROM grupos WHERE nombre_grupo = 'Gerencia'),
    CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_estado ON usuarios(estado);
CREATE INDEX idx_usuarios_perfil ON usuarios(id_perfil);
CREATE INDEX idx_usuarios_grupo ON usuarios(id_grupo);

-- Crear trigger para actualizar fecha_actualizacion
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

-- =====================================================
-- PERMISOS POR ROL
-- =====================================================

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
    id_permiso SERIAL PRIMARY KEY,
    nombre_permiso VARCHAR(100) UNIQUE NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar permisos específicos
INSERT INTO permisos (nombre_permiso, modulo, descripcion) VALUES
-- Dashboard
('ver_dashboard', 'dashboard', 'Ver dashboard principal'),
('ver_kpis', 'dashboard', 'Ver indicadores clave'),

-- Clientes
('ver_clientes', 'clientes', 'Ver lista de clientes'),
('crear_clientes', 'clientes', 'Crear nuevos clientes'),
('editar_clientes', 'clientes', 'Editar clientes existentes'),
('eliminar_clientes', 'clientes', 'Eliminar clientes'),

-- Campañas
('ver_campanas', 'campanas', 'Ver lista de campañas'),
('crear_campanas', 'campanas', 'Crear nuevas campañas'),
('editar_campanas', 'campanas', 'Editar campañas existentes'),
('eliminar_campanas', 'campanas', 'Eliminar campañas'),
('aprobar_campanas', 'campanas', 'Aprobar campañas'),

-- Órdenes
('ver_ordenes', 'ordenes', 'Ver órdenes de compra'),
('crear_ordenes', 'ordenes', 'Crear nuevas órdenes'),
('editar_ordenes', 'ordenes', 'Editar órdenes existentes'),
('eliminar_ordenes', 'ordenes', 'Eliminar órdenes'),
('aprobar_ordenes', 'ordenes', 'Aprobar órdenes'),

-- Reportes
('ver_reportes', 'reportes', 'Ver reportes generales'),
('ver_reportes_financieros', 'reportes', 'Ver reportes financieros'),
('exportar_reportes', 'reportes', 'Exportar reportes'),
('programar_reportes', 'reportes', 'Programar reportes automáticos'),

-- Usuarios
('ver_usuarios', 'usuarios', 'Ver lista de usuarios'),
('crear_usuarios', 'usuarios', 'Crear nuevos usuarios'),
('editar_usuarios', 'usuarios', 'Editar usuarios existentes'),
('eliminar_usuarios', 'usuarios', 'Eliminar usuarios'),
('asignar_roles', 'usuarios', 'Asignar roles a usuarios'),

-- Configuración
('ver_configuracion', 'configuracion', 'Ver configuración del sistema'),
('editar_configuracion', 'configuracion', 'Editar configuración del sistema');

-- Tabla de permisos por perfil
CREATE TABLE IF NOT EXISTS permisos_perfil (
    id_permiso_perfil SERIAL PRIMARY KEY,
    id_perfil INTEGER REFERENCES perfiles(id_perfil),
    id_permiso INTEGER REFERENCES permisos(id_permiso),
    UNIQUE(id_perfil, id_permiso)
);

-- Asignar permisos por rol

-- Director: Todos los permisos
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'director'),
    id_permiso
FROM permisos;

-- Gerente: Casi todos los permisos excepto configuración crítica
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'gerente'),
    id_permiso
FROM permisos
WHERE nombre_permiso NOT IN ('editar_configuracion', 'eliminar_usuarios');

-- Financiero: Permisos financieros y de reportes
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'financiero'),
    id_permiso
FROM permisos
WHERE modulo IN ('dashboard', 'clientes', 'campanas', 'ordenes', 'reportes')
AND nombre_permiso NOT IN ('eliminar_clientes', 'eliminar_campanas', 'eliminar_ordenes');

-- Supervisor: Permisos de supervisión
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'supervisor'),
    id_permiso
FROM permisos
WHERE nombre_permiso LIKE 'ver_%' 
OR nombre_permiso IN ('editar_campanas', 'editar_ordenes', 'aprobar_campanas');

-- Planificador: Permisos de planificación
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'planificador'),
    id_permiso
FROM permisos
WHERE modulo IN ('dashboard', 'clientes', 'campanas', 'ordenes', 'reportes')
AND nombre_permiso NOT IN ('eliminar_%', 'aprobar_%', 'ver_reportes_financieros');

-- Asistente: Permisos básicos
INSERT INTO permisos_perfil (id_perfil, id_permiso)
SELECT 
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'asistente'),
    id_permiso
FROM permisos
WHERE nombre_permiso LIKE 'ver_%' 
AND nombre_permiso NOT IN ('ver_reportes_financieros', 'ver_configuracion');

-- =====================================================
-- VISTA DE USUARIOS CON ROLES
-- =====================================================

CREATE VIEW vista_usuarios_completa AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.telefono,
    u.avatar,
    u.estado,
    u.ultimo_acceso,
    u.fecha_creacion,
    p.nombre_perfil,
    p.descripcion AS descripcion_perfil,
    p.nivel_acceso,
    g.nombre_grupo,
    g.descripcion AS descripcion_grupo
FROM usuarios u
LEFT JOIN perfiles p ON u.id_perfil = p.id_perfil
LEFT JOIN grupos g ON u.id_grupo = g.id_grupo;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar usuario creado
SELECT 'USUARIO CREADO:' AS info;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- Mostrar perfiles creados
SELECT 'PERFILES CREADOS:' AS info;
SELECT * FROM perfiles ORDER BY nivel_acceso DESC;

-- Mostrar permisos por perfil
SELECT 'PERMISOS POR PERFIL:' AS info;
SELECT 
    p.nombre_perfil,
    COUNT(pp.id_permiso) AS cantidad_permisos
FROM perfiles p
LEFT JOIN permisos_perfil pp ON p.id_perfil = pp.id_perfil
GROUP BY p.id_perfil, p.nombre_perfil
ORDER BY p.nivel_acceso DESC;

-- Confirmar creación
SELECT 'SISTEMA DE USUARIOS CREADO EXITOSAMENTE' AS resultado;