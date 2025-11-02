-- Consultar TODAS las comunas por región para ver los IDs reales
SELECT 
    r.id as id_region,
    r.nombreregion,
    c.id as id_comuna,
    c.nombrecomuna
FROM region r
JOIN comunas c ON c.id_region = r.id
WHERE r.id IN (2, 5, 6, 7, 8, 10)
ORDER BY r.id, c.nombrecomuna;

-- Mostrar solo las comunas principales de cada región
SELECT 
    'Región 2 - Antofagasta' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 2 AND c.nombrecomuna = 'Antofagasta'

UNION ALL

SELECT 
    'Región 5 - Valparaíso' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 5 AND c.nombrecomuna IN ('Valparaíso', 'Viña del Mar')

UNION ALL

SELECT 
    'Región 6 - Valparaíso (Los Lagos)' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 6 AND c.nombrecomuna = 'Viña del Mar'

UNION ALL

SELECT 
    'Región 7 - Metropolitana' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 7 AND c.nombrecomuna IN ('Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Maipú')

UNION ALL

SELECT 
    'Región 8 - Biobío' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 8 AND c.nombrecomuna = 'Concepción'

UNION ALL

SELECT 
    'Región 10 - Ñuble' as region_info,
    c.id as id_comuna,
    c.nombrecomuna
FROM comunas c
WHERE c.id_region = 10 AND c.nombrecomuna = 'Chillán'
ORDER BY region_info;