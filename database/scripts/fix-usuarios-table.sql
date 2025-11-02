-- ========================================
-- Corregir Tabla Usuarios - Agregar Campos Faltantes
-- ========================================

-- Agregar campos que la aplicación necesita pero no existen
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Email VARCHAR(100);
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Nombre VARCHAR(100);
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Apellido VARCHAR(100);
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Avatar TEXT;
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Estado BOOLEAN DEFAULT true;
ALTER TABLE Usuarios ADD COLUMN IF NOT EXISTS Password VARCHAR(255);

-- Crear triggers para sincronizar campos (compatibilidad)
CREATE OR REPLACE FUNCTION sync_usuario_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar email (minúsculas a mayúsculas)
    NEW.Email = NEW.email;
    
    -- Sincronizar nombre (minúsculas a mayúsculas)
    NEW.Nombre = NEW.nombre;
    
    -- Sincronizar estado (minúsculas a mayúsculas)
    NEW.Estado = NEW.estado;
    
    -- Sincronizar password (minúsculas a mayúsculas)
    NEW.Password = NEW.password;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para sincronización
DROP TRIGGER IF EXISTS sync_usuario_fields_trigger ON Usuarios;
CREATE TRIGGER sync_usuario_fields_trigger
    BEFORE INSERT OR UPDATE ON Usuarios
    FOR EACH ROW
    EXECUTE FUNCTION sync_usuario_fields();

-- Actualizar datos existentes para que tengan los campos sincronizados
UPDATE Usuarios SET 
    Email = email,
    Nombre = nombre,
    Estado = estado,
    Password = password
WHERE Email IS NULL OR Nombre IS NULL;

-- Insertar usuario Camilo con todos los campos necesarios
INSERT INTO Usuarios (
    nombre,
    email,
    password,
    id_perfil,
    id_grupo,
    estado,
    Apellido,
    Avatar
) VALUES (
    'Camilo Alegria Barra',
    'camiloalegriabarra@gmail.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6ukx.LrUpm', -- Hash para "Antonito26"
    1, -- Super Administrador
    1, -- Administradores
    true,
    'Barra',
    NULL
) ON CONFLICT (email) DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tabla Usuarios actualizada exitosamente';
    RAISE NOTICE 'Campos agregados: Email, Nombre, Apellido, Avatar, Estado, Password';
    RAISE NOTICE 'Triggers de sincronización creados';
    RAISE NOTICE 'Usuario Camilo Alegria Barra creado/actualizado';
    RAISE NOTICE 'Email: camiloalegriabarra@gmail.com';
    RAISE NOTICE 'Contraseña: Antonito26';
END $$;