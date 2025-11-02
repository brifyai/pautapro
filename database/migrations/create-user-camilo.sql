-- ========================================
-- Crear Usuario Super Administrador - Camilo Alegria
-- ========================================

-- Insertar usuario Camilo Alegria como Super Administrador
INSERT INTO Usuarios (
    nombre, 
    email, 
    password, 
    id_perfil, 
    id_grupo, 
    estado
) VALUES (
    'Camilo Alegria Barra', 
    'camiloalegriabarra@gmail.com', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Hash para "Antonito26"
    1, -- Super Administrador
    1, -- Administradores
    true
) ON CONFLICT (email) DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Usuario Camilo Alegria Barra creado exitosamente';
    RAISE NOTICE 'Email: camiloalegriabarra@gmail.com';
    RAISE NOTICE 'Perfil: Super Administrador';
    RAISE NOTICE 'Grupo: Administradores';
    RAISE NOTICE 'Estado: Activo';
    RAISE NOTICE 'Contraseña: Antonito26';
END $$;