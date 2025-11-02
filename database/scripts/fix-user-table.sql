-- =====================================================
-- VERIFICAR Y ARREGLAR ESTRUCTURA DE TABLA USUARIOS
-- =====================================================

-- 1. Primero, verificar la estructura actual de la tabla
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si la tabla usuarios existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'usuarios'
) AS table_exists;

-- 3. Crear tabla usuarios si no existe con estructura básica
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT true,
    id_perfil INTEGER DEFAULT 2,
    id_grupo INTEGER DEFAULT 2,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Agregar columnas faltantes si no existen
DO $$
BEGIN
    -- Agregar columna telefono si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='usuarios' 
        AND column_name='telefono'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
        RAISE NOTICE 'Columna telefono agregada';
    END IF;

    -- Agregar columna avatar si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='usuarios' 
        AND column_name='avatar'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN avatar VARCHAR(255);
        RAISE NOTICE 'Columna avatar agregada';
    END IF;

    -- Agregar columna ultimo_acceso si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='usuarios' 
        AND column_name='ultimo_acceso'
    ) THEN
        ALTER TABLE usuarios ADD COLUMN ultimo_acceso TIMESTAMP;
        RAISE NOTICE 'Columna ultimo_acceso agregada';
    END IF;
END $$;

-- 5. Crear tablas de perfiles y grupos si no existen
CREATE TABLE IF NOT EXISTS perfiles (
    id_perfil SERIAL PRIMARY KEY,
    nombre_perfil VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    nivel_acceso INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Insertar perfiles básicos si no existen
INSERT INTO perfiles (nombre_perfil, descripcion, nivel_acceso) VALUES
('director', 'Director con acceso completo', 5),
('gerente', 'Gerente con acceso a gestión', 4),
('financiero', 'Acceso a presupuestos y finanzas', 3),
('supervisor', 'Supervisor de campañas', 3),
('planificador', 'Planificador de campañas', 2),
('asistente', 'Asistente administrativo', 1)
ON CONFLICT (nombre_perfil) DO NOTHING;

-- 7. Insertar grupos básicos si no existen
INSERT INTO grupos (nombre_grupo, descripcion) VALUES
('Dirección', 'Nivel directivo'),
('Gerencia', 'Nivel gerencial'),
('Finanzas', 'Departamento financiero'),
('Operaciones', 'Operaciones y supervisión'),
('Planificación', 'Planificación de campañas'),
('Administración', 'Soporte administrativo')
ON CONFLICT (nombre_grupo) DO NOTHING;

-- 8. Eliminar usuario existente si existe para evitar conflictos
DELETE FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com';

-- 9. Insertar usuario Camilo Alegria (versión segura - solo columnas que existen)
INSERT INTO usuarios (
    nombre, 
    apellido, 
    email, 
    password, 
    estado,
    id_perfil,
    id_grupo,
    fecha_creacion
) VALUES (
    'Camilo',
    'Alegria',
    'camiloalegriabarra@gmail.com',
    'Antonito26',
    true,
    (SELECT id_perfil FROM perfiles WHERE nombre_perfil = 'gerente' LIMIT 1),
    (SELECT id_grupo FROM grupos WHERE nombre_grupo = 'Gerencia' LIMIT 1),
    CURRENT_TIMESTAMP
);

-- 10. Agregar teléfono y avatar si las columnas existen (UPDATE seguro)
DO $$
BEGIN
    -- Actualizar teléfono si la columna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='usuarios' 
        AND column_name='telefono'
    ) THEN
        UPDATE usuarios 
        SET telefono = '+56 9 1234 5678' 
        WHERE email = 'camiloalegriabarra@gmail.com';
        RAISE NOTICE 'Teléfono actualizado';
    END IF;

    -- Actualizar avatar si la columna existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='usuarios' 
        AND column_name='avatar'
    ) THEN
        UPDATE usuarios 
        SET avatar = '/img/default-avatar.png' 
        WHERE email = 'camiloalegriabarra@gmail.com';
        RAISE NOTICE 'Avatar actualizado';
    END IF;
END $$;

-- 11. Crear vista simplificada que funcione
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    -- Usar COALESCE para columnas que pueden no existir
    COALESCE(u.telefono, 'No especificado') AS telefono,
    COALESCE(u.avatar, '/img/default-avatar.png') AS avatar,
    u.estado,
    COALESCE(u.ultimo_acceso, NULL) AS ultimo_acceso,
    u.fecha_creacion,
    COALESCE(p.nombre_perfil, 'Sin perfil') AS nombre_perfil,
    COALESCE(p.descripcion, 'Sin descripción') AS descripcion_perfil,
    COALESCE(p.nivel_acceso, 1) AS nivel_acceso,
    COALESCE(g.nombre_grupo, 'Sin grupo') AS nombre_grupo,
    COALESCE(g.descripcion, 'Sin descripción') AS descripcion_grupo
FROM usuarios u
LEFT JOIN perfiles p ON u.id_perfil = p.id_perfil
LEFT JOIN grupos g ON u.id_grupo = g.id_grupo;

-- 12. Verificación final
SELECT 'VERIFICACIÓN FINAL:' AS resultado;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- 13. Mostrar estructura final de la tabla
SELECT 'ESTRUCTURA FINAL DE LA TABLA:' AS info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
AND table_schema = 'public'
ORDER BY ordinal_position;