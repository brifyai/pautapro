-- ===================================================================
-- SCRIPT SEGURO PARA RESTAURAR MEDIOS SIN PERDER DATOS
-- ===================================================================

-- ---------------------------------------------------------------
-- 1. VERIFICAR ESTADO ACTUAL DE LA TABLA MEDIOS
-- ---------------------------------------------------------------
SELECT
    'Estado actual de medios' as info,
    COUNT(*) as total_medios,
    COUNT(CASE WHEN nombre_medio IS NOT NULL THEN 1 END) as con_nombre,
    COUNT(CASE WHEN estado = true THEN 1 END) as con_estado
FROM medios;

-- ---------------------------------------------------------------
-- 2. INSERTAR MEDIOS ESENCIALES SI NO EXISTEN
-- ---------------------------------------------------------------
INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
SELECT 
    'Televisión', 
    'TV', 
    'Medios de televisión abierta y cable', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM medios WHERE nombre_medio ILIKE '%televisión%' OR nombre_medio ILIKE '%television%');

INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
SELECT 
    'Radio', 
    'Radio', 
    'Estaciones de radio AM y FM', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM medios WHERE nombre_medio ILIKE '%radio%');

INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
SELECT 
    'Prensa Escrita', 
    'Print', 
    'Diarios y revistas impresas', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM medios WHERE nombre_medio ILIKE '%prensa%' OR nombre_medio ILIKE '%escrita%');

INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
SELECT 
    'Digital', 
    'Online', 
    'Medios digitales y redes sociales', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM medios WHERE nombre_medio ILIKE '%digital%');

INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
SELECT 
    'Outdoor', 
    'OOH', 
    'Publicidad exterior y vallas', 
    true, 
    NOW(), 
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM medios WHERE nombre_medio ILIKE '%outdoor%' OR nombre_medio ILIKE '%exterior%');

-- ---------------------------------------------------------------
-- 3. INSERTAR MEDIOS ADICIONALES COMUNES
-- ---------------------------------------------------------------
INSERT INTO medios (nombre_medio, tipo_medio, descripcion, estado, created_at, updated_at) 
VALUES 
    ('Cine', 'Cine', 'Publicidad en salas de cine', true, NOW(), NOW()),
    ('Revistas', 'Print', 'Revistas especializadas y de consumo', true, NOW(), NOW()),
    ('Google Ads', 'Digital', 'Publicidad en plataforma Google', true, NOW(), NOW()),
    ('Facebook Ads', 'Digital', 'Publicidad en Facebook e Instagram', true, NOW(), NOW()),
    ('YouTube', 'Digital', 'Publicidad en videos de YouTube', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------
-- 4. ACTUALIZAR MEDIOS SIN NOMBRE
-- ---------------------------------------------------------------
UPDATE medios 
SET nombre_medio = CASE 
    WHEN id_medio = 1 THEN 'Televisión'
    WHEN id_medio = 2 THEN 'Radio'
    WHEN id_medio = 3 THEN 'Prensa Escrita'
    WHEN id_medio = 4 THEN 'Digital'
    WHEN id_medio = 5 THEN 'Outdoor'
    ELSE 'Medio ' || id_medio::text
END
WHERE nombre_medio IS NULL OR nombre_medio = '';

-- ---------------------------------------------------------------
-- 5. VERIFICACIÓN FINAL
-- ---------------------------------------------------------------
SELECT 
    'Verificación final' as info,
    id_medio,
    nombre_medio,
    tipo_medio,
    descripcion,
    estado
FROM medios 
ORDER BY id_medio;

-- ---------------------------------------------------------------
-- 6. ESTADÍSTICAS FINALES
-- ---------------------------------------------------------------
SELECT 
    'Estadísticas finales' as info,
    COUNT(*) as total_medios_creados,
    COUNT(CASE WHEN estado = true THEN 1 END) as medios_activos,
    COUNT(CASE WHEN tipo_medio = 'Digital' THEN 1 END) as medios_digitales,
    COUNT(CASE WHEN tipo_medio = 'TV' THEN 1 END) as medios_tv,
    COUNT(CASE WHEN tipo_medio = 'Radio' THEN 1 END) as medios_radio
FROM medios;

-- ===================================================================
-- RESUMEN DE OPERACIONES:
-- ✓ Verificado estado actual de medios
-- ✓ Insertados medios esenciales si no existen
-- ✓ Agregados medios adicionales comunes
-- ✓ Actualizados medios sin nombre
-- ✓ Generada verificación y estadísticas
-- ===================================================================