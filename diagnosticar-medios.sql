-- Script para diagnosticar y restaurar medios
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la tabla medios existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medios') THEN
        RAISE NOTICE '✅ Tabla medios existe';
    ELSE
        RAISE NOTICE '❌ Tabla medios NO existe';
    END IF;
END $$;

-- 2. Verificar estructura de la tabla medios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'medios' 
ORDER BY ordinal_position;

-- 3. Contar registros existentes
SELECT COUNT(*) as total_medios FROM medios;

-- 4. Mostrar registros existentes (si hay)
SELECT * FROM medios LIMIT 5;

-- 5. Limpiar tabla si existe y volver a crear con datos
DELETE FROM medios WHERE id IS NOT NULL;

-- 6. Insertar medios básicos si no existen
INSERT INTO medios (id, nombredelmedio, codigo, estado, duracion, codigo_megatime, color, calidad, cooperado, rubro) VALUES
(1, 'TV Abierta', 'TV001', true, true, false, false, true, false, false),
(2, 'TV Cable', 'TV002', true, true, false, false, true, false, false),
(3, 'Radio AM', 'RA001', true, true, false, false, false, false, false),
(4, 'Radio FM', 'RA002', true, true, false, false, false, false, false),
(5, 'Diario', 'DI001', true, false, false, false, false, false, false, false),
(6, 'Revista', 'RV001', true, false, false, false, false, false, false, false),
(7, 'Internet Banner', 'IN001', true, false, false, false, false, false, false, false),
(8, 'Redes Sociales', 'RS001', true, false, false, false, false, false, false, false),
(9, 'Cine', 'CI001', true, true, false, false, true, false, false, false),
(10, 'Vía Pública', 'VP001', true, false, false, false, false, false, false, false),
(11, 'Transporte', 'TR001', true, false, false, false, false, false, false, false),
(12, 'Marketing Digital', 'MD001', true, false, false, true, false, false, false, false)
ON CONFLICT (id) DO NOTHING;

-- 7. Verificar inserción
SELECT COUNT(*) as total_despues_insercion FROM medios;

-- 8. Mostrar todos los medios insertados
SELECT id, nombredelmedio, codigo, estado FROM medios ORDER BY id;

RAISE NOTICE '✅ Script de diagnóstico y restauración de medios completado';