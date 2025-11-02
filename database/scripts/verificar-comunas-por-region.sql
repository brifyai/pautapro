-- Consultar comunas por región para verificar IDs correctos
SELECT 
    r.id as id_region,
    r.nombre_region,
    c.id as id_comuna,
    c.nombrecomuna
FROM region r
JOIN comunas c ON c.id_region = r.id
WHERE r.id IN (2, 5, 6, 7, 8, 10)
ORDER BY r.id, c.nombrecomuna;

-- Verificar específicamente las comunas que estamos usando en el script
SELECT 
    'Comunas en script' as tipo,
    c.id as id_comuna,
    c.nombrecomuna,
    c.id_region as region_real,
    r.nombre_region as nombre_region_real
FROM comunas c
JOIN region r ON c.id_region = r.id
WHERE c.id IN (341, 322, 289, 261, 335, 256, 141, 274, 320, 120, 283, 21)
ORDER BY c.id;