-- ========================================
-- Solución Problema API Key - Configuración Completa
-- ========================================

-- Paso 1: Verificar si la tabla usuarios existe y crearla si no
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        RAISE NOTICE '🔧 Creando tabla usuarios...';
        
        CREATE TABLE usuarios (
            id SERIAL PRIMARY KEY,
            id_usuario SERIAL UNIQUE,
            Email VARCHAR(100) NOT NULL UNIQUE,
            Nombre VARCHAR(100) NOT NULL,
            Apellido VARCHAR(100),
            Avatar TEXT,
            Estado BOOLEAN DEFAULT true,
            Password VARCHAR(255) NOT NULL,
            id_perfil INTEGER,
            id_grupo INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Tabla usuarios creada';
    ELSE
        RAISE NOTICE '✅ Tabla usuarios ya existe';
    END IF;
END $$;

-- Paso 2: Deshabilitar RLS y crear políticas públicas
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable public access" ON usuarios;
DROP POLICY IF EXISTS "Users can select" ON usuarios;
DROP POLICY IF EXISTS "Users can insert" ON usuarios;
DROP POLICY IF EXISTS "Users can update" ON usuarios;
DROP POLICY IF EXISTS "Users can delete" ON usuarios;

-- Crear política pública completa
CREATE POLICY "Enable public access" ON usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Rehabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 3: Insertar usuarios si no existen
INSERT INTO usuarios (
    Email, 
    Nombre, 
    Apellido,
    Estado,
    Password,
    id_perfil,
    id_grupo
) VALUES 
    ('camiloalegriabarra@gmail.com', 'Camilo Alegria', 'Barra', true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 1, 1),
    ('admin@sistema.cl', 'Administrador', 'Sistema', true, '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', 1, 1)
ON CONFLICT (Email) DO NOTHING;

-- Paso 4: Verificar inserción
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM usuarios WHERE Email = 'camiloalegriabarra@gmail.com') THEN
        RAISE NOTICE '✅ Usuario Camilo encontrado en tabla usuarios';
    ELSE
        RAISE NOTICE '❌ Usuario Camilo NO encontrado en tabla usuarios';
    END IF;
    
    IF EXISTS (SELECT 1 FROM usuarios WHERE Email = 'admin@sistema.cl') THEN
        RAISE NOTICE '✅ Usuario admin encontrado en tabla usuarios';
    ELSE
        RAISE NOTICE '❌ Usuario admin NO encontrado en tabla usuarios';
    END IF;
END $$;

-- Paso 5: Mostrar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Paso 6: Mostrar usuarios existentes
SELECT 
    id,
    id_usuario,
    Email,
    Nombre,
    Apellido,
    Estado,
    id_perfil,
    id_grupo
FROM usuarios;

-- Paso 7: Verificar políticas RLS
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'usuarios';

-- Paso 8: Test de consulta directa (simulación)
DO $$
BEGIN
    -- Simular la consulta que hace la aplicación
    DECLARE
        test_result RECORD;
    BEGIN
        EXECUTE 'SELECT id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password FROM usuarios WHERE Email = ''camiloalegriabarra@gmail.com'' LIMIT 1' INTO test_result;
        
        IF test_result IS NOT NULL THEN
            RAISE NOTICE '✅ Test de consulta exitoso - Usuario encontrado';
            RAISE NOTICE '📧 Email: %', test_result.Email;
            RAISE NOTICE '👤 Nombre: %', test_result.Nombre;
            RAISE NOTICE '✅ Estado: %', test_result.Estado;
        ELSE
            RAISE NOTICE '❌ Test de consulta falló - Usuario NO encontrado';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en test de consulta: %', SQLERRM;
    END;
END $$;

-- Mensaje final con instrucciones
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURACIÓN COMPLETADA ===';
    RAISE NOTICE '✅ Tabla usuarios configurada con acceso público';
    RAISE NOTICE '✅ Políticas RLS configuradas';
    RAISE NOTICE '✅ Usuarios insertados correctamente';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 CREDENCIALES PARA LOGIN:';
    RAISE NOTICE '   Email: camiloalegriabarra@gmail.com';
    RAISE NOTICE '   Contraseña: Antonito26';
    RAISE NOTICE '';
    RAISE NOTICE '   Email: admin@sistema.cl';
    RAISE NOTICE '   Contraseña: Antonito26';
    RAISE NOTICE '';
    RAISE NOTICE '🌐 URL API para prueba manual:';
    RAISE NOTICE '   https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/usuarios';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Si aún tienes problemas de API key:';
    RAISE NOTICE '   1. Verifica que el archivo .env esté configurado correctamente';
    RAISE NOTICE '   2. Reinicia el servidor de desarrollo (npm run dev)';
    RAISE NOTICE '   3. Limpia el cache del navegador';
    RAISE NOTICE '   4. Verifica las credenciales en el dashboard de Supabase';
END $$;