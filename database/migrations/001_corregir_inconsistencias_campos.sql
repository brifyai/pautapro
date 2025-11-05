-- ========================================
-- MIGRACIÓN: Corregir Inconsistencias de Nombres de Campos
-- Sistema: PautaPro
-- Versión: 001
-- Fecha: 2025-01-04
-- ========================================

-- IMPORTANTE: Este script corrige las inconsistencias de nombres de campos
-- detectadas en el análisis. Ejecutar en Supabase SQL Editor.

BEGIN;

-- ========================================
-- 1. CORRECCIÓN TABLA MEDIOS
-- ========================================

-- Agregar campo estandarizado si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'medios' AND column_name = 'nombre_medio'
    ) THEN
        -- Si solo existe nombredelmedio, renombrar
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'medios' AND column_name = 'nombredelmedio'
        ) THEN
            ALTER TABLE Medios RENAME COLUMN nombredelmedio TO nombre_medio;
            RAISE NOTICE '✅ Campo Medios.nombredelmedio renombrado a nombre_medio';
        END IF;
    END IF;
END $$;

-- ========================================
-- 2. CORRECCIÓN TABLA CLASIFICACION
-- ========================================

-- Estandarizar a nombre_clasificacion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clasificacion' AND column_name = 'nombre_clasificacion'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clasificacion' AND column_name = 'NombreClasificacion'
        ) THEN
            ALTER TABLE Clasificacion RENAME COLUMN "NombreClasificacion" TO nombre_clasificacion;
            RAISE NOTICE '✅ Campo Clasificacion.NombreClasificacion renombrado a nombre_clasificacion';
        END IF;
    END IF;
END $$;

-- ========================================
-- 3. CORRECCIÓN TABLA TEMAS
-- ========================================

-- Estandarizar a nombre_tema
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'temas' AND column_name = 'nombre_tema'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'temas' AND column_name = 'NombreTema'
        ) THEN
            ALTER TABLE Temas'RENAME COLUMN "NombreTema" TO nombre_tema;
            RAISE NOTICE '✅ Campo Temas.NombreTema renombrado a nombre_tema';
        END IF;
    END IF;
END $$;

-- ========================================
-- 4. CORRECCIÓN TABLA PROVEEDORES - DIRECCIÓN
-- ========================================

-- Asegurar que existe direccion_facturacion como campo principal
DO $$
BEGIN
    -- Si no existe direccion_facturacion pero sí direccion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'direccion_facturacion'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'direccion'
    ) THEN
        -- Copiar datos de direccion a nuevo campo
        ALTER TABLE Proveedores ADD COLUMN direccion_facturacion VARCHAR(200);
        UPDATE Proveedores SET direccion_facturacion = direccion;
        RAISE NOTICE '✅ Campo Proveedores.direccion_facturacion creado y poblado';
    END IF;
END $$;

-- ========================================
-- 5. CORRECCIÓN TABLA PROVEEDORES - TELÉFONOS
-- ========================================

-- Estandarizar campos de teléfono
DO $$
BEGIN
    -- Telefono Celular
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'telefono_celular'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'telcelular'
    ) THEN
        ALTER TABLE Proveedores RENAME COLUMN telcelular TO telefono_celular;
        RAISE NOTICE '✅ Campo Proveedores.telcelular renombrado a telefono_celular';
    END IF;
    
    -- Telefono Fijo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'telefono_fijo'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'proveedores' AND column_name = 'telfijo'
    ) THEN
        ALTER TABLE Proveedores RENAME COLUMN telfijo TO telefono_fijo;
        RAISE NOTICE '✅ Campo Proveedores.telfijo renombrado a telefono_fijo';
    END IF;
END $$;

-- ========================================
-- 6. AGREGAR CAMPOS FALTANTES EN TABLAS EXISTENTES
-- ========================================

-- Agre campo created_at a todas las tablas que no lo tengan
DO $$
DECLARE
    tabla_record RECORD;
BEGIN
    FOR tabla_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'pg_%'
    LOOP
        -- Verificar si la tabla no tiene created_at
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = tabla_record.table_name 
            AND column_name = 'created_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', tabla_record.table_name);
            RAISE NOTICE 'Agregado created_at a tabla: %', tabla_record.table_name;
        END IF;
        
        -- Verificar si la tabla no tiene updated_at
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = tabla_record.table_name 
            AND column_name = 'updated_at'
        ) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', tabla_record.table_name);
            RAISE NOTICE 'Agregado updated_at a tabla: %', tabla_record.table_name;
        END IF;
    END LOOP;
END $$;

-- ========================================
-- 7. CAMPOS ADICIONALES DETECTADOS EN CÓDIGO
-- ========================================

-- Clientes: total_invertido
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'total_invertido'
    ) THEN
        ALTER TABLE Clientes ADD COLUMN total_invertido DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE '✅ Campo Clientes.total_invertido agregado';
    END IF;
END $$;

-- Clientes: direccionempresa
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'direccionempresa'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clientes' AND column_name = 'Direccion'
    ) THEN
        ALTER TABLE Clientes ADD COLUMN direccionempresa VARCHAR(200);
        RAISE NOTICE '✅ Campo Clientes.direccionempresa agregado';
    END IF;
END $$;

-- Usuarios: Avatar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'Avatar'
    ) THEN
        ALTER TABLE Usuarios ADD COLUMN "Avatar" VARCHAR(500);
        RAISE NOTICE '✅ Campo Usuarios.Avatar agregado';
    END IF;
END $$;

-- Usuarios: fechaCreacion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'fechaCreacion'
    ) THEN
        ALTER TABLE Usuarios ADD COLUMN "fechaCreacion" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Campo Usuarios.fechaCreacion agregado';
    END IF;
END $$;

-- Usuarios: fechadeultimamodificacion
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'fechadeultimamodificacion'
    ) THEN
        ALTER TABLE Usuarios ADD COLUMN fechadeultimamodificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Campo Usuarios.fechadeultimamodificacion agregado';
    END IF;
END $$;

-- Agencias: nombrefantasia (verificar inconsistencia)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agencias' AND column_name = 'nombrefantasia'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agencias' AND column_name = 'NombreDeFantasia'
    ) THEN
        ALTER TABLE Agencias RENAME COLUMN "NombreDeFantasia" TO nombrefantasia;
        RAISE NOTICE '✅ Campo Agencias.NombreDeFantasia renombrado a nombrefantasia';
    END IF;
END $$;

-- Contratos: campos de fechas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contratos' AND column_name = 'fecha_inicio'
    ) THEN
        ALTER TABLE Contratos ADD COLUMN fecha_inicio DATE;
        RAISE NOTICE '✅ Campo Contratos.fecha_inicio agregado';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contratos' AND column_name = 'fecha_fin'
    ) THEN
        ALTER TABLE Contratos ADD COLUMN fecha_fin DATE;
        RAISE NOTICE '✅ Campo Contratos.fecha_fin agregado';
    END IF;
END $$;

-- ========================================
-- 8. CREAR ALIASES/VISTAS PARA COMPATIBILIDAD
-- ========================================

-- Vista para mantener compatibilidad con código legacy que use nombredelmedio
CREATE OR REPLACE VIEW v_medios_compat AS
SELECT 
    id,
    nombre_medio as nombredelmedio,
    nombre_medio,
    codigo,
    duracion,
    color,
    codigo_megatime,
    calidad,
    cooperado,
    rubro,
    estado,
    created_at,
    updated_at
FROM Medios;

COMMENT ON VIEW v_medios_compat IS 'Vista de compatibilidad para código que use nombredelmedio';

-- ========================================
-- 9. ACTUALIZAR DATOS EXISTENTES
-- ========================================

-- Actualizar total_invertido calculándolo desde órdenes existentes
UPDATE Clientes c
SET total_invertido = (
    SELECT COALESCE(SUM(o.monto_total), 0)
    FROM OrdenesDePublicidad o
    WHERE o.id_cliente = c.id_cliente
    AND o.estado NOT IN ('anulada', 'rechazada')
)
WHERE EXISTS (
    SELECT 1 FROM OrdenesDePublicidad o 
    WHERE o.id_cliente = c.id_cliente
);

RAISE NOTICE '✅ Campo total_invertido actualizado para clientes existentes';

-- ========================================
-- FINALIZACIÓN
-- ========================================

COMMIT;

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Correcciones aplicadas:';
    RAISE NOTICE '  ✓ Medios: nombredelmedio -> nombre_medio';
    RAISE NOTICE '  ✓ Clasificacion: NombreClasificacion -> nombre_clasificacion';
    RAISE NOTICE '  ✓ Temas: NombreTema -> nombre_tema';
    RAISE NOTICE '  ✓ Proveedores: Campos de dirección y teléfono estandarizados';
    RAISE NOTICE '  ✓ Campos created_at y updated_at agregados donde faltaban';
    RAISE NOTICE '  ✓ Campos adicionales agregados a Clientes, Usuarios, Agencias';
    RAISE NOTICE '  ✓ Vista de compatibilidad creada';
    RAISE NOTICE '========================================';
    RAISE NOTICE '⚠️  SIGUIENTE PASO: Ejecutar crear-tablas-faltantes-completo.sql';
    RAISE NOTICE '========================================';
END $$;