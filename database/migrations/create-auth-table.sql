-- ========================================
-- Crear Tabla de Autenticación Separada
-- ========================================

-- Crear tabla específica para autenticación
CREATE TABLE IF NOT EXISTS auth_users (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100),
    Avatar TEXT,
    Estado BOOLEAN DEFAULT true,
    Password VARCHAR(255) NOT NULL,
    id_perfil INTEGER REFERENCES Perfiles(id),
    id_grupo INTEGER REFERENCES Grupos(id_grupo),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deshabilitar RLS para esta tabla
ALTER TABLE auth_users DISABLE ROW LEVEL SECURITY;

-- Crear política pública
CREATE POLICY "Enable public access to auth_users" ON auth_users
    FOR ALL USING (true)
    WITH CHECK (true);

-- Habilitar RLS
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Insertar usuario Camilo en la nueva tabla
INSERT INTO auth_users (
    id_usuario,
    Email, 
    Nombre, 
    Apellido,
    Avatar,
    Estado,
    Password,
    id_perfil,
    id_grupo
) VALUES (
    1,
    'camiloalegriabarra@gmail.com', 
    'Camilo Alegria', 
    'Barra',
    NULL,
    true,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
    1, -- Super Administrador
    1  -- Administradores
) ON CONFLICT (Email) DO NOTHING;

-- Insertar usuario administrador por defecto
INSERT INTO auth_users (
    id_usuario,
    Email, 
    Nombre, 
    Apellido,
    Avatar,
    Estado,
    Password,
    id_perfil,
    id_grupo
) VALUES (
    2,
    'admin@sistema.cl', 
    'Administrador', 
    'Sistema',
    NULL,
    true,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm',
    1, -- Super Administrador
    1  -- Administradores
) ON CONFLICT (Email) DO NOTHING;

-- Verificar inserción
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth_users WHERE Email = 'camiloalegriabarra@gmail.com') THEN
        RAISE NOTICE '✅ Usuario Camilo creado en auth_users';
    ELSE
        RAISE NOTICE '❌ Usuario Camilo NO encontrado en auth_users';
    END IF;
    
    IF EXISTS (SELECT 1 FROM auth_users WHERE Email = 'admin@sistema.cl') THEN
        RAISE NOTICE '✅ Usuario admin creado en auth_users';
    ELSE
        RAISE NOTICE '❌ Usuario admin NO encontrado en auth_users';
    END IF;
END $$;

-- Mostrar estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'auth_users'
ORDER BY ordinal_position;

-- Mostrar usuarios
SELECT 
    id,
    Email,
    Nombre,
    Apellido,
    Estado,
    id_perfil,
    id_grupo
FROM auth_users;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '🔓 Tabla auth_users creada y configurada';
    RAISE NOTICE '👤 Usuarios disponibles:';
    RAISE NOTICE '   - camiloalegriabarra@gmail.com (Antonito26)';
    RAISE NOTICE '   - admin@sistema.cl (Antonito26)';
    RAISE NOTICE '🌐 API URL: https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/auth_users';
END $$;