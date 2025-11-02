-- ========================================
-- Habilitar Acceso API - Tabla Usuarios
-- ========================================

-- Paso 1: Deshabilitar RLS (Row Level Security) temporalmente
ALTER TABLE Usuarios DISABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Users can view their own profile" ON Usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON Usuarios;
DROP POLICY IF EXISTS "Users can insert their profile" ON Usuarios;

-- Paso 3: Crear política pública para acceso completo (temporal)
CREATE POLICY "Enable public access" ON Usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Paso 4: Habilitar RLS nuevamente con políticas permisivas
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 5: Asegurar que la tabla tenga los campos correctos
DO $$
BEGIN
    -- Verificar y agregar campos si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Email') THEN
        ALTER TABLE Usuarios ADD COLUMN Email VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Nombre') THEN
        ALTER TABLE Usuarios ADD COLUMN Nombre VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Apellido') THEN
        ALTER TABLE Usuarios ADD COLUMN Apellido VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Avatar') THEN
        ALTER TABLE Usuarios ADD COLUMN Avatar TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Estado') THEN
        ALTER TABLE Usuarios ADD COLUMN Estado BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'Password') THEN
        ALTER TABLE Usuarios ADD COLUMN Password VARCHAR(255);
    END IF;
END $$;

-- Paso 6: Actualizar datos existentes para sincronización
UPDATE Usuarios SET 
    Email = email,
    Nombre = nombre,
    Estado = estado,
    Password = password
WHERE Email IS NULL OR Nombre IS NULL;

-- Paso 7: Insertar usuario Camilo si no existe
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

-- Paso 8: Verificar que el usuario existe y tiene todos los campos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM Usuarios 
        WHERE email = 'camiloalegriabarra@gmail.com' 
        AND Email IS NOT NULL 
        AND Nombre IS NOT NULL
    ) THEN
        RAISE NOTICE '✅ Usuario Camilo verificado con todos los campos';
    ELSE
        RAISE NOTICE '❌ Usuario Camilo no encontrado o incompleto';
    END IF;
END $$;

-- Paso 9: Mostrar estructura actual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Paso 10: Mostrar usuarios actuales
SELECT 
    id_usuario,
    email,
    Email,
    nombre,
    Nombre,
    estado,
    Estado
FROM Usuarios;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '🔓 Acceso API habilitado para tabla Usuarios';
    RAISE NOTICE '📋 Políticas RLS configuradas para acceso público';
    RAISE NOTICE '👤 Usuario Camilo: camiloalegriabarra@gmail.com';
    RAISE NOTICE '🔑 Contraseña: Antonito26';
    RAISE NOTICE '🌐 API URL: https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/Usuarios';
END $$;