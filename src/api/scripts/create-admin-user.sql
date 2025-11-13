-- =====================================================
-- CREACIÓN DEFINITIVA DE USUARIO ADMINISTRADOR
-- Usuario: camiloalegriabarra@gmail.com
-- =====================================================

-- PASO 1: VERIFICAR SI EL USUARIO EXISTE
DO $$
DECLARE
    user_exists BOOLEAN;
    user_count INTEGER;
BEGIN
    -- Contar usuarios con ese email
    SELECT COUNT(*) INTO user_count
    FROM usuarios
    WHERE email = 'camiloalegriabarra@gmail.com';

    RAISE NOTICE 'Usuarios encontrados con email camiloalegriabarra@gmail.com: %', user_count;

    IF user_count = 0 THEN
        -- El usuario NO existe, lo creamos
        RAISE NOTICE 'Creando usuario administrador...';

        INSERT INTO usuarios (nombre, email, estado)
        VALUES ('Camilo Alegria', 'camiloalegriabarra@gmail.com', true);

        RAISE NOTICE 'Usuario administrador creado exitosamente';

    ELSE
        -- El usuario existe, lo activamos
        RAISE NOTICE 'Activando usuario existente...';

        UPDATE usuarios
        SET estado = true
        WHERE email = 'camiloalegriabarra@gmail.com';

        RAISE NOTICE 'Usuario activado exitosamente';
    END IF;
END $$;

-- PASO 2: VERIFICAR RESULTADO FINAL
SELECT
    'USUARIO ADMINISTRADOR FINAL' as status,
    id_usuario,
    nombre,
    email,
    estado
FROM usuarios
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 3: MOSTRAR TODOS LOS USUARIOS PARA VERIFICAR
SELECT
    'TODOS LOS USUARIOS' as status,
    id_usuario,
    nombre,
    email,
    estado
FROM usuarios
ORDER BY id_usuario DESC
LIMIT 5;