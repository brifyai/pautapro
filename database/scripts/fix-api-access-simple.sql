-- ========================================
-- Solución Simple - Habilitar Acceso API
-- ========================================

-- Paso 1: Deshabilitar RLS temporalmente
ALTER TABLE Usuarios DISABLE ROW LEVEL SECURITY;

-- Paso 2: Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own profile" ON Usuarios;
DROP POLICY IF EXISTS "Users can update their own profile" ON Usuarios;
DROP POLICY IF EXISTS "Users can insert their profile" ON Usuarios;
DROP POLICY IF EXISTS "Enable public access" ON Usuarios;

-- Paso 3: Crear política pública para acceso completo
CREATE POLICY "Enable public access" ON Usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Paso 4: Habilitar RLS con la nueva política
ALTER TABLE Usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 5: Sincronizar datos existentes
UPDATE Usuarios SET 
    Email = COALESCE(Email, email),
    Nombre = COALESCE(Nombre, nombre),
    Estado = COALESCE(Estado, estado),
    Password = COALESCE(Password, password)
WHERE Email IS NULL OR Nombre IS NULL;

-- Paso 6: Insertar usuario Camilo si no existe
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

-- Paso 7: Verificar usuario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM Usuarios WHERE email = 'camiloalegriabarra@gmail.com') THEN
        RAISE NOTICE '✅ Usuario Camilo encontrado';
    ELSE
        RAISE NOTICE '❌ Usuario Camilo NO encontrado';
    END IF;
END $$;

-- Paso 8: Mostrar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
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
FROM Usuarios;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '🔓 Acceso API habilitado para tabla Usuarios';
    RAISE NOTICE '👤 Usuario Camilo: camiloalegriabarra@gmail.com';
    RAISE NOTICE '🔑 Contraseña: Antonito26';
    RAISE NOTICE '🌐 API URL: https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/Usuarios';
END $$;