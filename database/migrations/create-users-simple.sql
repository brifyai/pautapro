-- ========================================
-- Crear Usuarios para Acceso Rápido
-- ========================================

-- Paso 1: Crear tabla usuarios si no existe
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    id_usuario SERIAL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100),
    Avatar TEXT,
    Estado BOOLEAN DEFAULT true,
    Password VARCHAR(255) NOT NULL,
    id_perfil INTEGER DEFAULT 1,
    id_grupo INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 2: Crear tabla perfiles si no existe
CREATE TABLE IF NOT EXISTS perfiles (
    id SERIAL PRIMARY KEY,
    NombrePerfil VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear tabla grupos si no existe
CREATE TABLE IF NOT EXISTS grupos (
    id_grupo SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 4: Insertar datos iniciales en perfiles
INSERT INTO perfiles (NombrePerfil, descripcion) VALUES 
('Super Administrador', 'Acceso completo a todo el sistema'),
('Administrador', 'Acceso completo a configuración y usuarios'),
('Gerente', 'Acceso a reportes y aprobaciones'),
('Planificador', 'Gestión de planes y campañas'),
('Ejecutivo', 'Gestión de órdenes y ejecución'),
('Analista', 'Acceso a reportes y análisis'),
('Cliente', 'Acceso limitado a sus propios datos')
ON CONFLICT (NombrePerfil) DO NOTHING;

-- Paso 5: Insertar datos iniciales en grupos
INSERT INTO grupos (nombre_grupo) VALUES 
('Administradores'),
('Gerencia'),
('Planificación'),
('Ejecución de Campañas'),
('Facturación'),
('Reportes'),
('Clientes')
ON CONFLICT (nombre_grupo) DO NOTHING;

-- Paso 6: Insertar usuarios preconfigurados
INSERT INTO usuarios (
    Email, 
    Nombre, 
    Apellido,
    Estado,
    Password,
    id_perfil,
    id_grupo
) VALUES 
    ('camiloalegriabarra@gmail.com', 'Camilo Alegria', 'Barra', true, 'password123', 1, 1),
    ('admin@sistema.cl', 'Administrador', 'Sistema', true, 'password123', 1, 1)
ON CONFLICT (Email) DO NOTHING;

-- Paso 7: Configurar RLS para permitir acceso
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable public access" ON usuarios;

-- Crear política pública para permitir todo
CREATE POLICY "Enable public access" ON usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Rehabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 8: Mostrar resultados
SELECT 'USUARIOS CREADOS:' as mensaje;
SELECT 
    id,
    Email,
    Nombre,
    Apellido,
    Estado,
    id_perfil,
    id_grupo,
    created_at
FROM usuarios 
WHERE Email IN ('camiloalegriabarra@gmail.com', 'admin@sistema.cl');

SELECT 'PERFILES DISPONIBLES:' as mensaje;
SELECT id, NombrePerfil, descripcion FROM perfiles;

SELECT 'GRUPOS DISPONIBLES:' as mensaje;
SELECT id_grupo, nombre_grupo FROM grupos;

-- Mensaje final
SELECT '=== CONFIGURACIÓN COMPLETADA ===' as mensaje;
SELECT '✅ Usuarios creados exitosamente' as estado;
SELECT '✅ Acceso rápido sin contraseña habilitado' as estado;
SELECT '✅ Botón "🚀 ACCESO RÁPIDO" listo para usar' as estado;