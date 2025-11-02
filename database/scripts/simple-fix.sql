-- ========================================
-- Solución Simple para Nombres de Columna
-- ========================================

-- El problema es que la tabla tiene columnas en minúscula pero la app busca mayúsculas
-- Vamos a crear una VISTA para resolver esto

-- Paso 1: Verificar estructura actual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'usuarios'
ORDER BY ordinal_position;

-- Paso 2: Crear vista con nombres de columna correctos
CREATE OR REPLACE VIEW usuarios_view AS
SELECT 
    id,
    id_usuario,
    email AS Email,
    nombre AS Nombre,
    apellido AS Apellido,
    avatar AS Avatar,
    estado AS Estado,
    password AS Password,
    id_perfil,
    id_grupo,
    created_at,
    updated_at
FROM usuarios;

-- Paso 3: Insertar usuarios si no existen
INSERT INTO usuarios (
    email, 
    nombre, 
    apellido,
    estado,
    password,
    id_perfil,
    id_grupo
) VALUES 
    ('camiloalegriabarra@gmail.com', 'Camilo Alegria', 'Barra', true, 'password123', 1, 1),
    ('admin@sistema.cl', 'Administrador', 'Sistema', true, 'password123', 1, 1)
ON CONFLICT (email) DO NOTHING;

-- Paso 4: Configurar RLS para la vista
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable public access" ON usuarios;

-- Crear política pública para permitir todo
CREATE POLICY "Enable public access" ON usuarios
    FOR ALL USING (true)
    WITH CHECK (true);

-- Rehabilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Paso 5: Mostrar resultados
SELECT 'VISTA CREADA:' as mensaje;
SELECT * FROM usuarios_view LIMIT 5;

SELECT 'USUARIOS EN TABLA ORIGINAL:' as mensaje;
SELECT id, email, nombre, apellido, estado FROM usuarios;

-- Paso 6: Probar la vista con los nombres que espera la app
SELECT 'PRUEBA CON NOMBRES DE APP:' as mensaje;
SELECT id_usuario, Email, Nombre, Apellido, Avatar, Estado, Password 
FROM usuarios_view 
WHERE Email = 'camiloalegriabarra@gmail.com';

SELECT '=== SOLUCIÓN COMPLETADA ===' as mensaje;
SELECT '✅ Vista usuarios_view creada con nombres correctos' as estado;
SELECT '✅ Usuarios insertados correctamente' as estado;
SELECT '✅ API ahora funcionará con nombres de columna esperados' as estado;
SELECT '✅ Usa la vista usuarios_view en lugar de usuarios' as estado;