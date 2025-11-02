-- =====================================================
-- CREACIÓN RÁPIDA DE USUARIO CAMILO - VERSIÓN SIMPLE
-- =====================================================

-- Eliminar usuario existente si existe
DELETE FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com';

-- Crear perfiles si no existen
INSERT INTO perfiles (nombre_perfil, descripcion, nivel_acceso) VALUES
('director', 'Director con acceso completo', 5),
('gerente', 'Gerente con acceso a gestión', 4),
('financiero', 'Acceso a presupuestos y finanzas', 3),
('supervisor', 'Supervisor de campañas', 3),
('planificador', 'Planificador de campañas', 2),
('asistente', 'Asistente administrativo', 1)
ON CONFLICT (nombre_perfil) DO NOTHING;

-- Crear grupos si no existen
INSERT INTO grupos (nombre_grupo, descripcion) VALUES
('Dirección', 'Nivel directivo'),
('Gerencia', 'Nivel gerencial'),
('Finanzas', 'Departamento financiero'),
('Operaciones', 'Operaciones y supervisión'),
('Planificación', 'Planificación de campañas'),
('Administración', 'Soporte administrativo')
ON CONFLICT (nombre_grupo) DO NOTHING;

-- Crear usuario Camilo Alegria con contraseña simple
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
    'Antonito26', -- Contraseña en texto plano para desarrollo
    '+56 9 1234 5678',
    true,
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'gerente'),
    (SELECT id_grupo FROM grupos WHERE nombre_grupo = 'Gerencia'),
    CURRENT_TIMESTAMP
);

-- Crear vista si no existe
CREATE OR REPLACE VIEW vista_usuarios_completa AS
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

-- Verificar creación del usuario
SELECT 'USUARIO CREADO EXITOSAMENTE:' AS resultado;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- Mostrar credenciales
SELECT 'CREDENCIALES DE ACCESO:' AS info;
SELECT 'Email: camiloalegriabarra@gmail.com' AS email;
SELECT 'Contraseña: Antonito26' AS password;
SELECT 'Rol: Gerente' AS rol;
SELECT 'URL: http://localhost:3002' AS url;