-- Script completo para verificar y restaurar la tabla medios
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla medios existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medios' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabla medios existe en el schema public';
    ELSE
        RAISE NOTICE '❌ Tabla medios NO existe - Creándola...';
        CREATE TABLE medios (
            id INTEGER PRIMARY KEY,
            nombredelmedio VARCHAR(255) NOT NULL UNIQUE,
            codigo VARCHAR(50),
            estado BOOLEAN DEFAULT true,
            duracion BOOLEAN DEFAULT false,
            codigo_megatime BOOLEAN DEFAULT false,
            color BOOLEAN DEFAULT false,
            calidad BOOLEAN DEFAULT false,
            cooperado BOOLEAN DEFAULT false,
            rubro BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabla medios creada';
    END IF;
END $$;

-- 2. Verificar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'medios' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Contar registros actuales
SELECT COUNT(*) as total_medios FROM medios;

-- 4. Mostrar registros actuales si existen
SELECT id, nombredelmedio, codigo, estado FROM medios ORDER BY id LIMIT 10;

-- 5. Limpiar datos existentes (si hay)
DELETE FROM medios;

-- 6. Resetear secuencia si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'medios_id_seq') THEN
        PERFORM setval('medios_id_seq', 1, false);
        RAISE NOTICE '✅ Secuencia reseteada';
    END IF;
END $$;

-- 7. Insertar medios de ejemplo con datos completos
INSERT INTO medios (id, nombredelmedio, codigo, estado, duracion, codigo_megatime, color, calidad, cooperado, rubro) VALUES
(1, 'TV Abierta', 'TV001', true, true, false, false, true, false, false),
(2, 'TV Cable', 'TV002', true, true, false, false, true, false, false),
(3, 'Radio AM', 'RA001', true, true, false, false, false, false, false),
(4, 'Radio FM', 'RA002', true, true, false, false, false, false, false),
(5, 'Diario', 'DI001', true, false, false, false, false, false, false, false),
(6, 'Revista', 'RV001', true, false, false, false, false, false, false, false),
(7, 'Internet Banner', 'IN001', true, false, false, true, false, false, false, false),
(8, 'Redes Sociales', 'RS001', true, false, false, true, false, false, false, false),
(9, 'Cine', 'CI001', true, true, false, false, true, false, false, false),
(10, 'Vía Pública', 'VP001', true, false, false, false, false, false, false, false),
(11, 'Transporte', 'TR001', true, false, false, false, false, false, false, false),
(12, 'Marketing Digital', 'MD001', true, false, false, true, false, false, false, false),
(13, 'Streaming', 'ST001', true, true, false, true, false, true, false, false);

-- 8. Verificar inserción
SELECT COUNT(*) as total_despues_insercion FROM medios;

-- 9. Mostrar todos los medios insertados
SELECT 
    id, 
    nombredelmedio, 
    codigo, 
    estado,
    CASE WHEN estado THEN 'Activo' ELSE 'Inactivo' END as estado_texto
FROM medios 
ORDER BY id;

-- 10. Verificar si hay algún constraint o problema
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'medios'::regclass;

RAISE NOTICE '✅ Script de verificación y restauración completado';
RAISE NOTICE '📊 Total de medios insertados: %', (SELECT COUNT(*) FROM medios);