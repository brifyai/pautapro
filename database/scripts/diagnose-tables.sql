-- 🔍 DIAGNÓSTICO COMPLETO DE TABLAS DE USUARIOS
-- Este script analiza qué tablas de usuarios existen y cuál usar
-- Ejecutar en Supabase SQL Editor

-- ========================================
-- 1. VERIFICAR TABLAS EXISTENTES
-- ========================================

SELECT 
    table_name,
    table_type,
    '⭐ TABLA DE USUARIOS' as tipo
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name = 'usuarios' OR table_name = 'auth_users')
ORDER BY table_name;

-- ========================================
-- 2. ANALIZAR ESTRUCTURA DE TABLA usuarios
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        RAISE NOTICE '📊 ANÁLISIS DE TABLA usuarios:';
        
        -- Mostrar columnas
        RAISE NOTICE 'Columnas encontradas:';
        PERFORM pg_notify('debug', 
            'Columnas usuarios: ' || 
            (SELECT string_agg(column_name || ' (' || data_type || ')', ', ') 
             FROM information_schema.columns 
             WHERE table_name = 'usuarios')
        );
        
        -- Contar usuarios
        RAISE NOTICE 'Total de usuarios: %', 
            (SELECT COUNT(*) FROM usuarios);
            
        -- Verificar usuarios con email
        RAISE NOTICE 'Usuarios con email: %', 
            (SELECT COUNT(*) FROM usuarios WHERE email IS NOT NULL);
            
        -- Mostrar usuarios existentes
        RAISE NOTICE 'Usuarios encontrados:';
        PERFORM pg_notify('debug', 
            'Usuarios: ' || 
            (SELECT string_agg(email || ' (' || COALESCE(rol, 'sin rol') || ')', ', ') 
             FROM usuarios WHERE email IS NOT NULL LIMIT 5)
        );
        
        -- Verificar si Camilo existe
        IF EXISTS (SELECT 1 FROM usuarios WHERE email LIKE '%camilo%') THEN
            RAISE NOTICE '✅ Camilo encontrado en tabla usuarios';
        ELSE
            RAISE NOTICE '❌ Camilo NO encontrado en tabla usuarios';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Tabla usuarios NO existe';
    END IF;
END $$;

-- ========================================
-- 3. ANALIZAR ESTRUCTURA DE TABLA auth_users
-- ========================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users') THEN
        RAISE NOTICE '📊 ANÁLISIS DE TABLA auth_users:';
        
        -- Mostrar columnas
        RAISE NOTICE 'Columnas encontradas:';
        PERFORM pg_notify('debug', 
            'Columnas auth_users: ' || 
            (SELECT string_agg(column_name || ' (' || data_type || ')', ', ') 
             FROM information_schema.columns 
             WHERE table_name = 'auth_users')
        );
        
        -- Contar usuarios
        RAISE NOTICE 'Total de usuarios: %', 
            (SELECT COUNT(*) FROM auth_users);
            
        -- Verificar usuarios con email
        RAISE NOTICE 'Usuarios con email: %', 
            (SELECT COUNT(*) FROM auth_users WHERE email IS NOT NULL);
            
        -- Mostrar usuarios existentes
        RAISE NOTICE 'Usuarios encontrados:';
        PERFORM pg_notify('debug', 
            'Usuarios: ' || 
            (SELECT string_agg(email || ' (' || COALESCE(rol, 'sin rol') || ')', ', ') 
             FROM auth_users WHERE email IS NOT NULL LIMIT 5)
        );
        
        -- Verificar si Camilo existe
        IF EXISTS (SELECT 1 FROM auth_users WHERE email LIKE '%camilo%') THEN
            RAISE NOTICE '✅ Camilo encontrado en tabla auth_users';
        ELSE
            RAISE NOTICE '❌ Camilo NO encontrado en tabla auth_users';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Tabla auth_users NO existe';
    END IF;
END $$;

-- ========================================
-- 4. COMPARACIÓN Y RECOMENDACIÓN
-- ========================================

DO $$
DECLARE
    usuarios_existe BOOLEAN := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios');
    auth_users_existe BOOLEAN := EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users');
    usuarios_count INTEGER := 0;
    auth_users_count INTEGER := 0;
    camilo_en_usuarios BOOLEAN := FALSE;
    camilo_en_auth_users BOOLEAN := FALSE;
    tabla_recomendada TEXT;
BEGIN
    -- Contar usuarios en cada tabla
    IF usuarios_existe THEN
        SELECT COUNT(*) INTO usuarios_count FROM usuarios;
        SELECT EXISTS(SELECT 1 FROM usuarios WHERE email LIKE '%camilo%') INTO camilo_en_usuarios;
    END IF;
    
    IF auth_users_existe THEN
        SELECT COUNT(*) INTO auth_users_count FROM auth_users;
        SELECT EXISTS(SELECT 1 FROM auth_users WHERE email LIKE '%camilo%') INTO camilo_en_auth_users;
    END IF;
    
    -- Lógica de recomendación
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RECOMENDACIÓN AUTOMÁTICA:';
    
    IF usuarios_existe AND auth_users_existe THEN
        -- Ambas tablas existen
        IF usuarios_count > 0 AND auth_users_count = 0 THEN
            tabla_recomendada := 'usuarios';
            RAISE NOTICE '✅ USAR TABLA usuarios (tiene datos, auth_users está vacía)';
        ELSIF auth_users_count > 0 AND usuarios_count = 0 THEN
            tabla_recomendada := 'auth_users';
            RAISE NOTICE '✅ USAR TABLA auth_users (tiene datos, usuarios está vacía)';
        ELSIF camilo_en_usuarios AND NOT camilo_en_auth_users THEN
            tabla_recomendada := 'usuarios';
            RAISE NOTICE '✅ USAR TABLA usuarios (Camilo está aquí)';
        ELSIF camilo_en_auth_users AND NOT camilo_en_usuarios THEN
            tabla_recomendada := 'auth_users';
            RAISE NOTICE '✅ USAR TABLA auth_users (Camilo está aquí)';
        ELSIF usuarios_count >= auth_users_count THEN
            tabla_recomendada := 'usuarios';
            RAISE NOTICE '✅ USAR TABLA usuarios (tiene más datos: % vs %)', usuarios_count, auth_users_count;
        ELSE
            tabla_recomendada := 'auth_users';
            RAISE NOTICE '✅ USAR TABLA auth_users (tiene más datos: % vs %)', auth_users_count, usuarios_count;
        END IF;
    ELSIF usuarios_existe THEN
        -- Solo existe usuarios
        tabla_recomendada := 'usuarios';
        RAISE NOTICE '✅ USAR TABLA usuarios (solo esta tabla existe)';
    ELSIF auth_users_existe THEN
        -- Solo existe auth_users
        tabla_recomendada := 'auth_users';
        RAISE NOTICE '✅ USAR TABLA auth_users (solo esta tabla existe)';
    ELSE
        -- Ninguna existe
        RAISE NOTICE '❌ NO EXISTEN TABLAS DE USUARIOS - Crear tabla usuarios';
        RETURN;
    END IF;
    
    -- ========================================
    -- 5. ACCIONES RECOMENDADAS
    -- ========================================
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 ACCIONES RECOMENDADAS:';
    RAISE NOTICE '1. El sistema usará automáticamente la tabla ''%''', tabla_recomendada;
    RAISE NOTICE '2. No se requieren cambios manuales';
    RAISE NOTICE '3. authServiceAutoDetect detectará la tabla correcta automáticamente';
    RAISE NOTICE '4. El login funcionará sin configuración adicional';
    
    -- ========================================
    -- 6. VERIFICACIÓN DE CONTRASEÑAS
    -- ========================================
    
    IF tabla_recomendada = 'usuarios' AND camilo_en_usuarios THEN
        RAISE NOTICE '';
        RAISE NOTICE '🔐 VERIFICACIÓN DE CONTRASEÑA (usuarios):';
        EXECUTE format('SELECT email, password_hash FROM usuarios WHERE email LIKE ''%camilo%'' LIMIT 1')
        INTO email, password_hash;
        
        IF FOUND THEN
            RAISE NOTICE 'Email: %', email;
            RAISE NOTICE 'Contraseña almacenada: %', password_hash;
            IF password_hash = 'Antonito26' THEN
                RAISE NOTICE '✅ Contraseña coincide con valor esperado';
            ELSE
                RAISE NOTICE '⚠️ Contraseña no coincide - verificar valor correcto';
            END IF;
        END IF;
        
    ELSIF tabla_recomendada = 'auth_users' AND camilo_en_auth_users THEN
        RAISE NOTICE '';
        RAISE NOTICE '🔐 VERIFICACIÓN DE CONTRASEÑA (auth_users):';
        EXECUTE format('SELECT email, password_hash FROM auth_users WHERE email LIKE ''%camilo%'' LIMIT 1')
        INTO email, password_hash;
        
        IF FOUND THEN
            RAISE NOTICE 'Email: %', email;
            RAISE NOTICE 'Contraseña almacenada: %', password_hash;
            IF password_hash = 'Antonito26' THEN
                RAISE NOTICE '✅ Contraseña coincide con valor esperado';
            ELSE
                RAISE NOTICE '⚠️ Contraseña no coincide - verificar valor correcto';
            END IF;
        END IF;
    END IF;
    
END $$;

-- ========================================
-- 7. RESUMEN FINAL
-- ========================================

SELECT 
    'RESUMEN DE DIAGNÓSTICO' as titulo,
    'Ejecutar authServiceAutoDetect.login()' as accion_recomendada,
    'El sistema detectará automáticamente la tabla correcta' as metodo,
    'No requiere configuración manual' as configuracion;

-- ========================================
-- 8. DATOS DE CAMILO (SI EXISTE)
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👤 DATOS DE CAMILO ENCONTRADOS:';
    
    -- Buscar en usuarios
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        FOR camilo_data IN 
            SELECT email, rol, estado, fecha_actualizacion as ultima_actualizacion
            FROM usuarios 
            WHERE email LIKE '%camilo%' OR nombre ILIKE '%camilo%'
        LOOP
            RAISE NOTICE '📋 En tabla usuarios:';
            RAISE NOTICE '   Email: %', camilo_data.email;
            RAISE NOTICE '   Rol: %', camilo_data.rol;
            RAISE NOTICE '   Estado: %', camilo_data.estado;
            RAISE NOTICE '   Última actualización: %', camilo_data.ultima_actualizacion;
        END LOOP;
    END IF;
    
    -- Buscar en auth_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'auth_users') THEN
        FOR camilo_data IN 
            SELECT email, rol, estado, updated_at as ultima_actualizacion
            FROM auth_users 
            WHERE email LIKE '%camilo%' OR nombre ILIKE '%camilo%'
        LOOP
            RAISE NOTICE '📋 En tabla auth_users:';
            RAISE NOTICE '   Email: %', camilo_data.email;
            RAISE NOTICE '   Rol: %', camilo_data.rol;
            RAISE NOTICE '   Estado: %', camilo_data.estado;
            RAISE NOTICE '   Última actualización: %', camilo_data.ultima_actualizacion;
        END LOOP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email LIKE '%camilo%' OR nombre ILIKE '%camilo%')
       AND NOT EXISTS (SELECT 1 FROM auth_users WHERE email LIKE '%camilo%' OR nombre ILIKE '%camilo%') THEN
        RAISE NOTICE '❌ No se encontró a Camilo en ninguna tabla';
        RAISE NOTICE '💡 Considerar crear usuario con:';
        RAISE NOTICE '   Email: camiloalegriabarra@gmail.com';
        RAISE NOTICE '   Password: Antonito26';
        RAISE NOTICE '   Rol: admin';
        RAISE NOTICE '   Estado: activo';
    END IF;
    
END $$;

-- ========================================
-- 9. INSTRUCCIONES FINALES
-- ========================================

SELECT 
    '🚀 INSTRUCCIONES FINALES' as paso,
    '1. Ir a http://localhost:3002/login' as instruccion_1,
    '2. Usar email: camiloalegriabarra@gmail.com' as instruccion_2,
    '3. Usar contraseña: Antonito26' as instruccion_3,
    '4. O hacer clic en "Acceso Rápido Camilo"' as instruccion_4,
    '5. Revisar consola para ver qué tabla detectó' as instruccion_5;

RAISE NOTICE '';
RAISE NOTICE '🎉 DIAGNÓSTICO COMPLETADO';
RAISE NOTICE 'El sistema está listo para usar detección automática';
RAISE NOTICE 'Revisar la consola del navegador para ver el proceso de detección';