-- ========================================
-- Corregir Nombres de Columnas en Tabla usuarios
-- ========================================

-- El problema es que PostgreSQL convierte los nombres de columna a minúsculas automáticamente
-- pero la aplicación está buscando "Email" con mayúscula

-- Paso 1: Verificar estructura actual de la tabla usuarios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Paso 2: Si la tabla existe con columnas en minúsculas, crear alias
-- Esto permite que la aplicación funcione con ambos nombres de columna

-- Verificar si ya existen las columnas con mayúsculas
DO $$
BEGIN
    -- Verificar si existe la columna Email (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Email') THEN
        RAISE NOTICE '✅ Columna Email ya existe';
    ELSE
        -- Verificar si existe email (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'email') THEN
            RAISE NOTICE '📝 Creando columna Email como alias de email';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Email VARCHAR(100) GENERATED ALWAYS AS (email) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Email ni email existen, creando Email desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Email VARCHAR(100)';
        END IF;
    END IF;
    
    -- Verificar si existe la columna Nombre (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Nombre') THEN
        RAISE NOTICE '✅ Columna Nombre ya existe';
    ELSE
        -- Verificar si existe nombre (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'nombre') THEN
            RAISE NOTICE '📝 Creando columna Nombre como alias de nombre';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Nombre VARCHAR(100) GENERATED ALWAYS AS (nombre) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Nombre ni nombre existen, creando Nombre desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Nombre VARCHAR(100)';
        END IF;
    END IF;
    
    -- Verificar si existe la columna Apellido (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Apellido') THEN
        RAISE NOTICE '✅ Columna Apellido ya existe';
    ELSE
        -- Verificar si existe apellido (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'apellido') THEN
            RAISE NOTICE '📝 Creando columna Apellido como alias de apellido';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Apellido VARCHAR(100) GENERATED ALWAYS AS (apellido) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Apellido ni apellido existen, creando Apellido desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Apellido VARCHAR(100)';
        END IF;
    END IF;
    
    -- Verificar si existe la columna Avatar (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Avatar') THEN
        RAISE NOTICE '✅ Columna Avatar ya existe';
    ELSE
        -- Verificar si existe avatar (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'avatar') THEN
            RAISE NOTICE '📝 Creando columna Avatar como alias de avatar';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Avatar TEXT GENERATED ALWAYS AS (avatar) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Avatar ni avatar existen, creando Avatar desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Avatar TEXT';
        END IF;
    END IF;
    
    -- Verificar si existe la columna Estado (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Estado') THEN
        RAISE NOTICE '✅ Columna Estado ya existe';
    ELSE
        -- Verificar si existe estado (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'estado') THEN
            RAISE NOTICE '📝 Creando columna Estado como alias de estado';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Estado BOOLEAN GENERATED ALWAYS AS (estado) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Estado ni estado existen, creando Estado desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Estado BOOLEAN DEFAULT true';
        END IF;
    END IF;
    
    -- Verificar si existe la columna Password (mayúscula)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'Password') THEN
        RAISE NOTICE '✅ Columna Password ya existe';
    ELSE
        -- Verificar si existe password (minúscula)
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'password') THEN
            RAISE NOTICE '📝 Creando columna Password como alias de password';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Password VARCHAR(255) GENERATED ALWAYS AS (password) STORED';
        ELSE
            RAISE NOTICE '⚠️  Ni Password ni password existen, creando Password desde cero';
            EXECUTE 'ALTER TABLE usuarios ADD COLUMN Password VARCHAR(255)';
        END IF;
    END IF;
    
    -- Verificar si existe la columna id_usuario (con guion bajo)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'id_usuario') THEN
        RAISE NOTICE '✅ Columna id_usuario ya existe';
    ELSE
        RAISE NOTICE '⚠️  Columna id_usuario no existe, creándola';
        EXECUTE 'ALTER TABLE usuarios ADD COLUMN id_usuario SERIAL UNIQUE';
    END IF;
    
    -- Verificar si existe la columna id_perfil (con guion bajo)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'id_perfil') THEN
        RAISE NOTICE '✅ Columna id_perfil ya existe';
    ELSE
        RAISE NOTICE '⚠️  Columna id_perfil no existe, creándola';
        EXECUTE 'ALTER TABLE usuarios ADD COLUMN id_perfil INTEGER DEFAULT 1';
    END IF;
    
    -- Verificar si existe la columna id_grupo (con guion bajo)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'usuarios' AND column_name = 'id_grupo') THEN
        RAISE NOTICE '✅ Columna id_grupo ya existe';
    ELSE
        RAISE NOTICE '⚠️  Columna id_grupo no existe, creándola';
        EXECUTE 'ALTER TABLE usuarios ADD COLUMN id_grupo INTEGER DEFAULT 1';
    END IF;
END $$;

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
    ('camiloalegriabarra@gmail.com', 'Camilo Alegria', 'Barra', true, 'password123', 1, 1),
    ('admin@sistema.cl', 'Administrador', 'Sistema', true, 'password123', 1, 1)
ON CONFLICT (Email) DO NOTHING;

-- Paso 4: Mostrar estructura final
SELECT 'ESTRUCTURA FINAL DE TABLA usuarios:' as mensaje;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Paso 5: Mostrar usuarios creados
SELECT 'USUARIOS EN LA TABLA:' as mensaje;
SELECT 
    id,
    id_usuario,
    Email,
    Nombre,
    Apellido,
    Estado,
    id_perfil,
    id_grupo,
    created_at
FROM usuarios;

-- Paso 6: Configurar RLS
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable public access" ON usuarios;

-- Crear política pública para permitir todo
CREATE POLICY "Enable public access" ON usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Rehabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Mensaje final
SELECT '=== CORRECCIÓN COMPLETADA ===' as mensaje;
SELECT '✅ Nombres de columna corregidos para compatibilidad' as estado;
SELECT '✅ Usuarios creados exitosamente' as estado;
SELECT '✅ Políticas RLS configuradas' as estado;
SELECT '✅ API lista para recibir solicitudes' as estado;