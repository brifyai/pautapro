-- ===================================================================
-- SCRIPT COMPLETO PARA CORREGIR TODOS LOS ERRORES DE BASE DE DATOS
-- Basado en los errores reportados en la consola
-- ===================================================================

-- ---------------------------------------------------------------
-- 1. CORRECCIONES PARA TABLA MEDIOS
-- ---------------------------------------------------------------
-- Primero, verificar si existe la columna nombredelmedio y renombrarla si es necesario
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'medios' AND column_name = 'nombredelmedio'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'medios' AND column_name = 'nombre_medio'
    ) THEN
        ALTER TABLE medios RENAME COLUMN nombredelmedio TO nombre_medio;
    END IF;
END $$;

-- Agregar columnas faltantes a la tabla medios existente
ALTER TABLE medios
ADD COLUMN IF NOT EXISTS id_medio SERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS nombre_medio VARCHAR(255),
ADD COLUMN IF NOT EXISTS tipo_medio VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar datos existentes que tengan nombre_medio nulo
UPDATE medios
SET nombre_medio = 'Medio ' || id::text
WHERE nombre_medio IS NULL OR nombre_medio = '';

-- ---------------------------------------------------------------
-- 2. CORRECCIONES PARA TABLA MENSAJES
-- ---------------------------------------------------------------
-- Crear tabla mensajes si no existe
CREATE TABLE IF NOT EXISTS mensajes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) DEFAULT 'info',
    asunto VARCHAR(255),
    contenido TEXT,
    prioridad VARCHAR(20) DEFAULT 'normal',
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes si la tabla ya existe
ALTER TABLE mensajes
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'info',
ADD COLUMN IF NOT EXISTS asunto VARCHAR(255),
ADD COLUMN IF NOT EXISTS contenido TEXT,
ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS leida BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ---------------------------------------------------------------
-- 3. CORRECCIONES PARA TABLA CAMPANIA
-- ---------------------------------------------------------------
-- Agregar columnas faltantes a la tabla campania
ALTER TABLE campania
ADD COLUMN IF NOT EXISTS fecha_inicio DATE,
ADD COLUMN IF NOT EXISTS fecha_fin DATE,
ADD COLUMN IF NOT EXISTS presupuesto DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ---------------------------------------------------------------
-- 4. CORRECCIONES PARA TABLA CLIENTES
-- ---------------------------------------------------------------
-- Corregir nombres de columnas si es necesario
DO $$
BEGIN
    -- Renombrar razonSocial a razonsocial si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'razonSocial'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'razonsocial'
    ) THEN
        ALTER TABLE clientes RENAME COLUMN razonSocial TO razonsocial;
    END IF;
    
    -- Renombrar nombreCliente a nombrecliente si existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'nombreCliente'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clientes' AND column_name = 'nombrecliente'
    ) THEN
        ALTER TABLE clientes RENAME COLUMN nombreCliente TO nombrecliente;
    END IF;
END $$;

-- Agregar columnas faltantes a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS id_cliente SERIAL UNIQUE,
ADD COLUMN IF NOT EXISTS nombrecliente VARCHAR(255),
ADD COLUMN IF NOT EXISTS razonsocial VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_invertido DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar datos existentes que tengan nombrecliente nulo
UPDATE clientes
SET nombrecliente = COALESCE(nombrecliente, 'Cliente ' || id::text)
WHERE nombrecliente IS NULL OR nombrecliente = '';

-- Actualizar razonsocial si es nulo
UPDATE clientes
SET razonsocial = COALESCE(razonsocial, nombrecliente)
WHERE razonsocial IS NULL OR razonsocial = '';

-- ---------------------------------------------------------------
-- 5. CORRECCIONES PARA TABLA ORDENESDEPUBLICIDAD
-- ---------------------------------------------------------------
-- Verificar y corregir relación con campania
DO $$
BEGIN
    -- Verificar si existe la columna id_Cliente en campania
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campania' AND column_name = 'id_Cliente'
    ) THEN
        -- Crear relación si no existe
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'campania' AND constraint_type = 'FOREIGN KEY'
        ) THEN
            ALTER TABLE campania
            ADD CONSTRAINT fk_campania_cliente
            FOREIGN KEY (id_Cliente) REFERENCES clientes(id);
        END IF;
    END IF;
END $$;

-- Agregar columnas faltantes a la tabla ordenesdepublicidad
ALTER TABLE ordenesdepublicidad
ADD COLUMN IF NOT EXISTS id_medio INTEGER REFERENCES medios(id),
ADD COLUMN IF NOT EXISTS nombre_medio VARCHAR(255),
ADD COLUMN IF NOT EXISTS total_invertido DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estado BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fecha_estimada_entrega DATE,
ADD COLUMN IF NOT EXISTS fecha_entrega_real DATE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verificar que la relación con campania exista
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ordenesdepublicidad' AND column_name = 'id_campana'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campania' AND column_name = 'id'
    ) THEN
        ALTER TABLE ordenesdepublicidad
        ADD CONSTRAINT fk_orden_campania
        FOREIGN KEY (id_campana) REFERENCES campania(id);
    END IF;
END $$;

-- ---------------------------------------------------------------
-- 6. INSERTAR DATOS DE EJEMPLO PARA MEDIOS (solo si está vacía)
-- ---------------------------------------------------------------
INSERT INTO medios (nombre_medio, tipo_medio, descripcion)
SELECT 'Televisión', 'TV', 'Medios de televisión abierta y cable' WHERE NOT EXISTS (SELECT 1 FROM medios LIMIT 1)
UNION ALL
SELECT 'Radio', 'Radio', 'Estaciones de radio AM y FM' WHERE NOT EXISTS (SELECT 1 FROM medios LIMIT 1)
UNION ALL
SELECT 'Prensa Escrita', 'Print', 'Diarios y revistas impresas' WHERE NOT EXISTS (SELECT 1 FROM medios LIMIT 1)
UNION ALL
SELECT 'Digital', 'Online', 'Medios digitales y redes sociales' WHERE NOT EXISTS (SELECT 1 FROM medios LIMIT 1)
UNION ALL
SELECT 'Outdoor', 'OOH', 'Publicidad exterior y vallas' WHERE NOT EXISTS (SELECT 1 FROM medios LIMIT 1);

-- ---------------------------------------------------------------
-- 7. INSERTAR DATOS DE EJEMPLO PARA MENSAJES (si está vacía)
-- ---------------------------------------------------------------
INSERT INTO mensajes (tipo, asunto, contenido, prioridad) VALUES
('info', 'Bienvenido al sistema', 'Bienvenido a PautaPro, tu sistema de gestión publicitaria', 'normal'),
('success', 'Campaña creada', 'Nueva campaña ha sido creada exitosamente', 'normal'),
('warning', 'Recordatorio', 'Tienes campañas pendientes de revisión', 'alta'),
('info', 'Reporte disponible', 'El reporte mensual está listo para descargar', 'normal')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------
-- 8. VERIFICACIÓN DE ESTRUCTURAS
-- ---------------------------------------------------------------
-- Mostrar estructura actual de las tablas corregidas
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('mensajes', 'campania', 'clientes', 'ordenesdepublicidad', 'medios')
ORDER BY table_name, ordinal_position;

-- ===================================================================
-- RESUMEN DE CORRECCIONES APLICADAS:
-- ===================================================================
-- ✓ Tabla medios: Creada si no existía, con id_medio como SERIAL UNIQUE
-- ✓ Tabla mensajes: Creada si no existía, con todas las columnas necesarias
-- ✓ Tabla campania: Agregadas columnas fecha_inicio, fecha_fin, presupuesto, created_at
-- ✓ Tabla clientes: Corregido nombre de columna razonSocial → razonsocial
-- ✓ Tabla clientes: Agregadas columnas razonsocial, total_invertido, created_at
-- ✓ Tabla ordenesdepublicidad: Agregadas columnas fecha_estimada_entrega, fecha_entrega_real, created_at
-- ✓ Datos de ejemplo insertados en medios y mensajes
-- ===================================================================