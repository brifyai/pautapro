-- ========================================
-- Diagnóstico y Solución Definitiva - Tabla Usuarios
-- ========================================

-- Paso 1: Verificar si la tabla existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Usuarios') THEN
        RAISE NOTICE '✅ Tabla Usuarios existe';
    ELSE
        RAISE NOTICE '❌ Tabla Usuarios NO existe - Creándola ahora';
    END IF;
END $$;

-- Paso 2: Si no existe, crearla con la estructura correcta
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    id SERIAL UNIQUE, -- Para compatibilidad con referencias existentes
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    id_perfil INTEGER REFERENCES Perfiles(id),
    id_grupo INTEGER REFERENCES Grupos(id_grupo),
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos adicionales para compatibilidad con la aplicación
    Email VARCHAR(100),
    Nombre VARCHAR(100),
    Apellido VARCHAR(100),
    Avatar TEXT,
    Estado BOOLEAN DEFAULT true,
    Password VARCHAR(255)
);

-- Paso 3: Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON Usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_email_upper ON Usuarios(Email);

-- Paso 4: Crear trigger para sincronización
CREATE OR REPLACE FUNCTION sync_usuario_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar campos automáticamente
    NEW.Email = NEW.email;
    NEW.Nombre = NEW.nombre;
    NEW.Estado = NEW.estado;
    NEW.Password = NEW.password;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 5: Crear trigger
DROP TRIGGER IF EXISTS sync_usuario_fields_trigger ON Usuarios;
CREATE TRIGGER sync_usuario_fields_trigger
    BEFORE INSERT OR UPDATE ON Usuarios
    FOR EACH ROW
    EXECUTE FUNCTION sync_usuario_fields();

-- Paso 6: Insertar usuario Camilo (si no existe)
INSERT INTO Usuarios (
    nombre, 
    email, 
    password, 
    id_perfil, 
    id_grupo, 
    estado,
    Apellido,
    Avatar
) VALUES (
    'Camilo Alegria Barra', 
    'camiloalegriabarra@gmail.com', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
    1, -- Super Administrador
    1, -- Administradores
    true,
    'Barra',
    NULL
) ON CONFLICT (email) DO NOTHING;

-- Paso 7: Verificar inserción
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE email = 'camiloalegriabarra@gmail.com') THEN
        RAISE NOTICE '✅ Usuario Camilo encontrado y creado correctamente';
    ELSE
        RAISE NOTICE '❌ Usuario Camilo NO encontrado - Revisar inserción';
    END IF;
END $$;

-- Paso 8: Mostrar estructura actual de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'Usuarios'
ORDER BY ordinal_position;

-- Paso 9: Mostrar usuarios existentes
SELECT 
    id_usuario,
    email,
    Email,
    nombre,
    Nombre,
    estado,
    Estado
FROM Usuarios 
LIMIT 5;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '🎯 Diagnóstico completado';
    RAISE NOTICE '📋 Revisa los resultados arriba';
    RAISE NOTICE '🔑 Usuario Camilo: camiloalegriabarra@gmail.com';
    RAISE NOTICE '🔑 Contraseña: Antonito26';
END $$;