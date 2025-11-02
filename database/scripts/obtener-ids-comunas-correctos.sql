-- Obtener IDs correctos de comunas específicas para cada región
SELECT 
    c.id as id_comuna,
    c.nombrecomuna,
    r.id as id_region,
    r.nombre_region
FROM comunas c
JOIN region r ON c.id_region = r.id
WHERE 
    (r.id = 7 AND c.nombrecomuna IN ('Providencia', 'Santiago', 'Vitacura', 'Las Condes', 'Maipú')) OR
    (r.id = 5 AND c.nombrecomuna IN ('Quilpué')) OR
    (r.id = 8 AND c.nombrecomuna IN ('Concepción')) OR
    (r.id = 10 AND c.nombrecomuna IN ('Chillán')) OR
    (r.id = 6 AND c.nombrecomuna IN ('Viña del Mar')) OR
    (r.id = 2 AND c.nombrecomuna IN ('Antofagasta'))
ORDER BY r.id, c.nombrecomuna;

-- También verificar comunas adicionales que podríamos necesitar
SELECT 
    c.id as id_comuna,
    c.nombrecomuna,
    r.id as id_region,
    r.nombre_region
FROM comunas c
JOIN region r ON c.id_region = r.id
WHERE 
    c.nombrecomuna IN ('La Florida', 'Puente Alto', 'La Pintana', 'San Bernardo', 'Quilicura')
ORDER BY r.id, c.nombrecomuna;