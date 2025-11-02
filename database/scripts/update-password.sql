-- 🔐 ACTUALIZAR CONTRASEÑA DE CAMILO
-- Este script actualiza la contraseña de Camilo con el hash correcto para "Antonito26"

-- Actualizar contraseña en tabla usuarios (si existe)
UPDATE usuarios 
SET password_hash = '$2b$12$mJodKxTVgvzbTl1HqpHi1.lP8juay3aJ8o7l3FBRHNV7wdV18.dBu'
WHERE email LIKE '%camilo%';

-- Actualizar contraseña en tabla auth_users (si existe)
UPDATE auth_users 
SET password_hash = '$2b$12$mJodKxTVgvzbTl1HqpHi1.lP8juay3aJ8o7l3FBRHNV7wdV18.dBu'
WHERE email LIKE '%camilo%';

-- Verificar actualización
SELECT 
    'usuarios' as tabla,
    email,
    LEFT(password_hash, 20) || '...' as hash_inicio,
    'Antonito26' as contraseña_plana
FROM usuarios 
WHERE email LIKE '%camilo%'

UNION ALL

SELECT 
    'auth_users' as tabla,
    email,
    LEFT(password_hash, 20) || '...' as hash_inicio,
    'Antonito26' as contraseña_plana
FROM auth_users 
WHERE email LIKE '%camilo%';

-- Mostrar mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Contraseña actualizada correctamente';
    RAISE NOTICE '📝 Nueva contraseña: Antonito26';
    RAISE NOTICE '🔐 Nuevo hash: $2b$12$mJodKxTVgvzbTl1HqpHi1.lP8juay3aJ8o7l3FBRHNV7wdV18.dBu';
    RAISE NOTICE '🎯 Ahora puedes hacer login con: camiloalegriabarra@gmail.com / Antonito26';
END $$;