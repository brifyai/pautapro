-- Verificar que las comunas asignadas existan en la base de datos
SELECT 
    c.id,
    c.nombrecomuna,
    r.nombre_region,
    r.id as id_region
FROM comunas c
JOIN region r ON c.id_region = r.id
WHERE c.id IN (
    341, 322, 289, 261, 335,  -- Región Metropolitana
    256, 261, 141, 274, 320,  -- Otras comunas
    322, 274, 120, 283, 21
)
ORDER BY r.id, c.nombrecomuna;

-- Verificar comunas específicas para cada región
SELECT 
    'Región Metropolitana (7)' as region,
    COUNT(*) as total_comunas
FROM comunas 
WHERE id_region = 7

UNION ALL

SELECT 
    'Valparaíso (5)' as region,
    COUNT(*) as total_comunas
FROM comunas 
WHERE id_region = 5

UNION ALL

SELECT 
    'Biobío (8)' as region,
    COUNT(*) as total_comunas
FROM comunas 
WHERE id_region = 8

UNION ALL

SELECT 
    'Ñuble (10)' as region,
    COUNT(*) as total_comunas
FROM comunas 
WHERE id_region = 10

UNION ALL

SELECT 
    'Antofagasta (2)' as region,
    COUNT(*) as total_comunas
FROM comunas 
WHERE id_region = 2;