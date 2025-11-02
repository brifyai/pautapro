-- ========================================
-- Diagnóstico Completo del Sistema
-- ========================================

-- Paso 1: Verificar todas las tablas que existen
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO COMPLETO DEL SISTEMA ===';
    
    -- Verificar tablas de usuarios
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        RAISE NOTICE '✅ Tabla "usuarios" existe';
    ELSE
        RAISE NOTICE '❌ Tabla "usuarios" NO existe';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Usuarios') THEN
        RAISE NOTICE '✅ Tabla "Usuarios" existe';
    ELSE
        RAISE NOTICE '❌ Tabla "Usuarios" NO existe';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auth_users') THEN
        RAISE NOTICE '✅ Tabla "auth_users" existe';
    ELSE
        RAISE NOTICE '❌ Tabla "auth_users" NO existe';
    END IF;
    
    -- Verificar tablas relacionadas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'perfiles') THEN
        RAISE NOTICE '✅ Tabla "perfiles" existe';
    ELSE
        RAISE NOTICE '❌ Tabla "perfiles" NO existe';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'grupos') THEN
        RAISE NOTICE '✅ Tabla "grupos" existe';
    ELSE
        RAISE NOTICE '❌ Tabla "grupos" NO existe';
    END IF;
END $$;

-- Paso 2: Mostrar estructura de todas las tablas de usuarios
RAISE NOTICE '=== ESTRUCTURA DE TABLAS ===';

-- Estructura de usuarios (minúsculas)
SELECT 
    'usuarios' as tabla,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Estructura de Usuarios (mayúsculas)
SELECT 
    'Usuarios' as tabla,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'Usuarios'
ORDER BY ordinal_position;

-- Estructura de auth_users
SELECT 
    'auth_users' as tabla,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'auth_users'
ORDER BY ordinal_position;

-- Paso 3: Verificar políticas RLS
RAISE NOTICE '=== POLÍTICAS RLS ===';

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('usuarios', 'Usuarios', 'auth_users')
ORDER BY tablename, policyname;

-- Paso 4: Verificar datos en todas las tablas
RAISE NOTICE '=== DATOS EN TABLAS ===';

-- Datos en usuarios (minúsculas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'usuarios') THEN
        RAISE NOTICE 'Datos en tabla "usuarios": %', (SELECT COUNT(*) FROM usuarios);
        PERFORM dblink_connect('tmp_conn', 'host=localhost user=postgres');
    END IF;
END $$;

-- Datos en Usuarios (mayúsculas)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Usuarios') THEN
        RAISE NOTICE 'Datos en tabla "Usuarios": %', (SELECT COUNT(*) FROM Usuarios);
    END IF;
END $$;

-- Datos en auth_users
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auth_users') THEN
        RAISE NOTICE 'Datos en tabla "auth_users": %', (SELECT COUNT(*) FROM auth_users);
    END IF;
END $$;

-- Paso 5: Crear tabla definitiva si ninguna existe
DO $$
BEGIN
    -- Si ninguna tabla de usuarios existe, crear una definitiva
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'Usuarios', 'auth_users')
    ) THEN
        RAISE NOTICE '🔧 Creando tabla definitiva de usuarios...';
        
        EXECUTE '
        CREATE TABLE usuarios (
            id SERIAL PRIMARY KEY,
            Email VARCHAR(100) NOT NULL UNIQUE,
            Nombre VARCHAR(100) NOT NULL,
            Apellido VARCHAR(100),
            Avatar TEXT,
            Estado BOOLEAN DEFAULT true,
            Password VARCHAR(255) NOT NULL,
            id_perfil INTEGER,
            id_grupo INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
        
        INSERT INTO usuarios (Email, Nombre, Apellido, Estado, Password, id_perfil, id_grupo) VALUES
        (''camiloalegriabarra@gmail.com'', ''Camilo Alegria'', ''Barra'', true, ''$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm'', 1, 1),
        (''admin@sistema.cl'', ''Administrador'', ''Sistema'', true, ''$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm'', 1, 1);
        
        RAISE NOTICE '✅ Tabla "usuarios" creada con éxito';
    END IF;
END $$;

-- Paso 6: Verificación final
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    
    -- Verificar que al menos una tabla exista
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'Usuarios', 'auth_users')
    ) THEN
        RAISE NOTICE '✅ Al menos una tabla de usuarios existe';
    ELSE
        RAISE NOTICE '❌ NO EXISTE NINGUNA TABLA DE USUARIOS';
    END IF;
    
    -- Verificar que Camilo exista
    DECLARE
        camilo_exists BOOLEAN := FALSE;
    BEGIN
        -- Verificar en usuarios
        BEGIN
            EXECUTE 'SELECT EXISTS(SELECT 1 FROM usuarios WHERE Email = ''camiloalegriabarra@gmail.com'')' INTO camilo_exists;
        EXCEPTION WHEN OTHERS THEN
            -- Tabla no existe o error
            NULL;
        END;
        
        -- Verificar en Usuarios si no encontró
        IF NOT camilo_exists THEN
            BEGIN
                EXECUTE 'SELECT EXISTS(SELECT 1 FROM Usuarios WHERE Email = ''camiloalegriabarra@gmail.com'')' INTO camilo_exists;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END;
        
        -- Verificar en auth_users si no encontró
        IF NOT camilo_exists THEN
            BEGIN
                EXECUTE 'SELECT EXISTS(SELECT 1 FROM auth_users WHERE Email = ''camiloalegriabarra@gmail.com'')' INTO camilo_exists;
            EXCEPTION WHEN OTHERS THEN
                NULL;
            END;
        END;
        
        IF camilo_exists THEN
            RAISE NOTICE '✅ Usuario Camilo encontrado';
        ELSE
            RAISE NOTICE '❌ Usuario Camilo NO encontrado en ninguna tabla';
        END IF;
    END;
END $$;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO COMPLETADO ===';
    RAISE NOTICE '📋 Revisa los resultados arriba para identificar el problema';
    RAISE NOTICE '🔑 Si creaste una nueva tabla, usa: camiloalegriabarra@gmail.com / Antonito26';
    RAISE NOTICE '🌐 API URLs para probar:';
    RAISE NOTICE '   - https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/usuarios';
    RAISE NOTICE '   - https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/Usuarios';
    RAISE NOTICE '   - https://rfjbsoxkgmuehrgteljq.supabase.co/rest/v1/auth_users';
END $$;