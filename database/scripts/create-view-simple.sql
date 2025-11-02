-- =====================================================
-- CREAR VISTA SIMPLE PARA USUARIO EXISTENTE
-- =====================================================

-- 1. Primero, verificar el usuario existente
SELECT 'VERIFICANDO USUARIO EXISTENTE:' AS info;
SELECT 
    id,
    nombre,
    apellido,
    email,
    estado,
    fecha_creacion
FROM usuarios 
WHERE email = 'camiloalegriabarra@gmail.com';

-- 2. Crear vista simple que funcione con la estructura actual
CREATE OR REPLACE VIEW vista_usuarios_completa AS
SELECT 
    u.id AS id_usuario,
    u.nombre,
    u.apellido,
    u.email,
    u.estado,
    u.fecha_creacion,
    -- Valores fijos para Camilo (id_usuario = 2)
    CASE 
        WHEN u.id = 2 THEN 'gerente'
        ELSE 'Sin perfil'
    END AS nombre_perfil,
    CASE 
        WHEN u.id = 2 THEN 'Gerente con acceso a gestión y reportes'
        ELSE 'Sin descripción'
    END AS descripcion_perfil,
    CASE 
        WHEN u.id = 2 THEN 4
        ELSE 1
    END AS nivel_acceso,
    CASE 
        WHEN u.id = 2 THEN 'Gerencia'
        ELSE 'Sin grupo'
    END AS nombre_grupo,
    CASE 
        WHEN u.id = 2 THEN 'Nivel gerencial de gestión'
        ELSE 'Sin descripción'
    END AS descripcion_grupo
FROM usuarios u;

-- 3. Verificar que la vista funcione
SELECT 'VERIFICANDO VISTA CREADA:' AS info;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- 4. Si el usuario no existe, crearlo con id_usuario = 2
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuarios WHERE email = 'camiloalegriabarra@gmail.com'
    ) THEN
        INSERT INTO usuarios (id, nombre, apellido, email, password, estado, fecha_creacion)
        VALUES (2, 'Camilo', 'Alegria', 'camiloalegriabarra@gmail.com', 'Antonito26', true, CURRENT_TIMESTAMP);
        RAISE NOTICE 'Usuario Camilo creado con id_usuario = 2';
    ELSE
        RAISE NOTICE 'Usuario Camilo ya existe';
    END IF;
END $$;

-- 5. Verificación final
SELECT 'VERIFICACIÓN FINAL:' AS resultado;
SELECT * FROM vista_usuarios_completa WHERE email = 'camiloalegriabarra@gmail.com';

-- 6. Mostrar credenciales
SELECT 'CREDENCIALES DE ACCESO:' AS info;
SELECT 'Email: camiloalegriabarra@gmail.com' AS email;
SELECT 'Contraseña: Antonito26' AS password;
SELECT 'ID Usuario: 2' AS user_id;
SELECT 'URL: http://localhost:3002' AS url;