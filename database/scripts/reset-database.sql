-- ========================================
-- Script para Resetear la Base de Datos
-- ========================================
-- Este script eliminará todas las tablas existentes y las volverá a crear

-- Deshabilitar triggers temporales
SET session_replication_role = replica;

-- Eliminar tablas en orden inverso para evitar conflictos de claves foráneas
DROP TABLE IF EXISTS plan_alternativas CASCADE;
DROP TABLE IF EXISTS campana_planes CASCADE;
DROP TABLE IF EXISTS campania_temas CASCADE;
DROP TABLE IF EXISTS alternativa CASCADE;
DROP TABLE IF EXISTS plan CASCADE;
DROP TABLE IF EXISTS OrdenesDePublicidad CASCADE;
DROP TABLE IF EXISTS Facturas CASCADE;
DROP TABLE IF EXISTS Temas CASCADE;
DROP TABLE IF EXISTS Campania CASCADE;
DROP TABLE IF EXISTS Clasificacion CASCADE;
DROP TABLE IF EXISTS programa_medios CASCADE;
DROP TABLE IF EXISTS Programas CASCADE;
DROP TABLE IF EXISTS Contratos CASCADE;
DROP TABLE IF EXISTS Productos CASCADE;
DROP TABLE IF EXISTS soporte_medios CASCADE;
DROP TABLE IF EXISTS proveedor_soporte CASCADE;
DROP TABLE IF EXISTS Soportes CASCADE;
DROP TABLE IF EXISTS Proveedores CASCADE;
DROP TABLE IF EXISTS Clientes CASCADE;
DROP TABLE IF EXISTS Agencias CASCADE;
DROP TABLE IF EXISTS Usuarios CASCADE;
DROP TABLE IF EXISTS aviso CASCADE;
DROP TABLE IF EXISTS OtrosDatos CASCADE;
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS contactocliente CASCADE;
DROP TABLE IF EXISTS Comisiones CASCADE;
DROP TABLE IF EXISTS TablaFormato CASCADE;
DROP TABLE IF EXISTS Meses CASCADE;
DROP TABLE IF EXISTS Anios CASCADE;
DROP TABLE IF EXISTS TipoGeneracionDeOrden CASCADE;
DROP TABLE IF EXISTS FormaDePago CASCADE;
DROP TABLE IF EXISTS Calidad CASCADE;
DROP TABLE IF EXISTS Medios CASCADE;
DROP TABLE IF EXISTS Perfiles CASCADE;
DROP TABLE IF EXISTS Grupos CASCADE;
DROP TABLE IF EXISTS TipoCliente CASCADE;
DROP TABLE IF EXISTS Comunas CASCADE;
DROP TABLE IF EXISTS Region CASCADE;

-- Rehabilitar triggers
SET session_replication_role = DEFAULT;

-- Limpiar secuencias
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'ALTER SEQUENCE ' || r.sequence_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- Mostrar mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos reseteada exitosamente';
    RAISE NOTICE 'Todas las tablas han sido eliminadas';
    RAISE NOTICE 'Ahora puede ejecutar database-schema.sql para crear la estructura nueva';
END $$;