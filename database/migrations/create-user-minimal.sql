-- =====================================================
-- CREACIÓN MÍNIMA DE USUARIO - SOLO COLUMNAS ESENCIALES
-- =====================================================

-- 1. Verificar qué columnas existen realmente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Crear tabla usuarios mínima si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Eliminar usuario existente para evitar conflictos
DELETE FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com';

-- 4. Insertar usuario Camilo con solo columnas esenciales
INSERT INTO usuarios (nombre, apellido, email, password, estado, fecha_creacion)
VALUES ('Camilo', 'Alegria', 'camiloalegriabarra@gmail.com', 'Antonito26', true, CURRENT_TIMESTAMP);

-- 5. Verificar que el usuario se creó correctamente
SELECT 'USUARIO CREADO:' AS resultado;
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

-- 6. Crear vista simple que solo use columnas existentes
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id AS id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.estado,
    u.fecha_creacion,
    'gerente' AS nombre_perfil,
    'Gerente con acceso a gestión' AS descripcion_perfil,
    4 AS nivel_acceso,
    'Gerencia' AS nombre_grupo,
    'Nivel gerencial' AS descripcion_grupo
FROM usuarios u
WHERE u.email = 'camiloalegriabarra@gmail.com';

-- 7. Verificar vista
SELECT 'VISTA CREADA:' AS resultado;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- 8. Mostrar credenciales finales
SELECT 'CREDENCIALES DE ACCESO:' AS info;
SELECT 'Email: camiloalegriabarra@gmail.com' AS email;
SELECT 'Contraseña: Antonito26' AS password;
SELECT 'URL: http://localhost:3002' AS url;